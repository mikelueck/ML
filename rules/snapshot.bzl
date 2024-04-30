load("@bazel_skylib//lib:shell.bzl", "shell")

# This contains a bunch of Bazel rules for copying generated files from *.proto
# back into the source tree.  This is needed to faciliate IDEs resolving the
# generated symbols.  Right now it really only does this for goLang files.

# Use these rules as follows:
# load("//rules:snapshot.bzl", "snapshot")
# snapshot(dep=":chat_go_proto") (ie the target that generates the go_proto_library)

def snapshot_(ctx, files):
    print("Copying generated files for proto library %s" % ctx.attr.dep)
    generated = ctx.attr.dep[OutputGroupInfo].go_generated_srcs.to_list()
    content = ""
    for f in generated:
       line = "cp -f %s %s/;\n" % (f.path, ctx.attr.dir)
       content += line
    substitutions = {
        "@@CONTENT@@": shell.quote(content),
    }
    out = ctx.actions.declare_file(ctx.label.name + ".sh")
    ctx.actions.expand_template(
        template = ctx.file._template,
        output = out,
        substitutions = substitutions,
        is_executable = True,
    )
    runfiles = ctx.runfiles(files = [generated[0]])
    return [
        DefaultInfo(
            files = depset([out]),
            runfiles = runfiles,
            executable = out,
        ),
    ]

def snapshot_test_(ctx, files):
    generated = ctx.attr.dep[OutputGroupInfo].go_generated_srcs.to_list()
    content = ""
    for f in generated:
       line = "diff %s %s/%s;\n" % (f.short_path, ctx.attr.dir, f.basename)
       content += line
       content += line
    substitutions = {
        "@@CONTENT@@": shell.quote(content),
    }
    out = ctx.actions.declare_file(ctx.label.name + ".sh")
    ctx.actions.expand_template(
        template = ctx.file._template,
        output = out,
        substitutions = substitutions,
        is_executable = True,
    )
    runfiles = ctx.runfiles(files = [generated[0]])
    return [
        DefaultInfo(
            files = depset([out]),
            runfiles = runfiles,
            executable = out,
        ),
    ]

def snapshot_impl(ctx, **kwargs):
   return snapshot_(ctx, ctx.files.dep)

def snapshot_test_impl(ctx, **kwargs):
   return snapshot_test_(ctx, ctx.files.dep)

_snapshot = rule(
  implementation = snapshot_impl,
  attrs = {
    "dir": attr.string(),
    "dep": attr.label(),
    "_template": attr.label(
        default = ":copy_into_workspace.sh",
        allow_single_file = True,
    ),
    # It is not used, just used for versioning since this is experimental
    "version": attr.string(),
  },
)

_snapshot_test = rule(
  implementation = snapshot_test_impl,
  test = True,
  attrs = {
    "dir": attr.string(),
    "dep": attr.label(),
    "_template": attr.label(
        default = ":diff_with_workspace.sh",
        allow_single_file = True,
    ),
    # It is not used, just used for versioning since this is experimental
    "version": attr.string(),
  },
)

def snapshot(name = "snapshot", **kwargs):
  if not "dir" in kwargs:
     dir = native.package_name()
     kwargs["dir"] = dir

  snapshot_name = "%s_snapshot" % name

  _snapshot(name = snapshot_name, **kwargs)

  _snapshot_test(name = "%s_test" % snapshot_name, **kwargs)

  native.filegroup(name="snapshot_files", srcs = native.glob(["*.pb.*"]))

  native.sh_binary(
    name = name,
    srcs = [":%s" % snapshot_name],
  )

  native.sh_test(
    name = "%s_test" % name,
    srcs = [":%s_test" % snapshot_name],
    data = [":snapshot_files", kwargs["dep"]],
  )
