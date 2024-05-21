load("//rules:defaults.bzl","GCP_PROJECT", "DEFAULT_GCP_LOCATION", "DEFAULT_GCP_CF_LOCATION")
load("@bazel_skylib//lib:shell.bzl", "shell")
load("@rules_oci//oci:defs.bzl", "oci_image", "oci_image_index", "oci_push", "oci_tarball")
load("@rules_pkg//:pkg.bzl", "pkg_tar")

def cf_deploy_(ctx):
    tar_file = ""
    if ctx.attr.local_tar:
      tar_file = ctx.attr.local_tar[DefaultInfo].files.to_list()[0].short_path

    sha_file = ctx.attr.sha_dep[DefaultInfo].files.to_list()[0].short_path

    substitutions = {
      "@@EMULATE@@": shell.quote(ctx.attr.emulate),
      "@@LOCAL_TAR@@": shell.quote(tar_file),
      "@@DIGEST_FILE@@": shell.quote(sha_file),
      "@@PROJECT_ID@@": shell.quote(ctx.attr.project_id),
      "@@LOCATION@@": shell.quote(ctx.attr.location),
      "@@FUNCTION@@": shell.quote(ctx.attr.function),
      "@@ENTRYPOINT@@": shell.quote(ctx.attr.entrypoint),
      "@@RUNTIME@@": shell.quote(ctx.attr.runtime),
      "@@REPOSITORY@@": shell.quote(ctx.attr.repository),
      "@@SERVICE_ACCT@@": shell.quote(ctx.attr.service_acct),
    }
    out = ctx.actions.declare_file(ctx.label.name + ".sh")
    ctx.actions.expand_template(
        template = ctx.file._template,
        output = out,
        substitutions = substitutions,
        is_executable = True,
    )
    runfiles = ctx.runfiles(files = ctx.attr.sha_dep[DefaultInfo].files.to_list())
    if ctx.attr.local_tar:
      runfiles = ctx.runfiles(files = ctx.attr.local_tar[DefaultInfo].files.to_list())

    return [
        DefaultInfo(
            files = depset([out]),
            runfiles = runfiles,
            executable = out,
        ),
    ]

def cf_deploy_impl(ctx, **kwargs):
   return cf_deploy_(ctx)

_cf_deploy = rule(
  implementation = cf_deploy_impl,
  attrs = {
    "emulate": attr.string(default="0"),
    "local_tar": attr.label(),
    "sha_dep": attr.label(),
    "project_id": attr.string(),
    "location": attr.string(),
    "function": attr.string(),
    "repository": attr.string(),
    "runtime": attr.string(),
    "entrypoint": attr.string(),
    "service_acct": attr.string(default="slackbot"),
    "_template": attr.label(
        default = ":deploy_cf.sh",
        allow_single_file = True,
    ),
    # It is not used, just used for versioning since this is experimental
    "version": attr.string(),
  },
)

# inspired by https://github.com/weisi/bazel_for_gcloud_python/blob/master/infra/serverless/gcf_rules.bzl

SRC_ZIP_EXTENSION = 'zip'
SRC_PY_EXTENSION = 'py'

def _compute_module_name(f):
  return f.basename.split('.')[0]

def _compute_module_path(f):
  components = []
  components.extend(f.dirname.split('/'))
  components.append(_compute_module_name(f))
  return '.'.join(components)

def _py_cloud_function_src_impl(ctx, **kwargs):
  src_zip = None
  src_py = None

  requirements = ctx.attr.requirements_file.files.to_list()[0].short_path
  inputs = ctx.attr.requirements_file.files.to_list()

  inputs.extend(ctx.attr.dep.files.to_list())

  for f in ctx.attr.dep.files.to_list():
    if f.extension == SRC_ZIP_EXTENSION:
      inputs.append(f)
      src_zip = f
    if f.extension == SRC_PY_EXTENSION:
      src_py = f

  if not src_zip:
    fail('ZIP src input not found.', 'src')
  if not src_py:
    fail('PY src input not found.', 'src')

  args = []

  module_name = _compute_module_path(src_py)

  archive = ctx.actions.declare_file(ctx.label.name + ".tar")
  substitutions = {
    "@@WORKSPACE_NAME@@": shell.quote(ctx.workspace_name),
    "@@ZIP_PATH@@": shell.quote(src_zip.path),
    "@@MODULE_NAME@@": shell.quote(module_name),
    "@@REQUIREMENTS@@": shell.quote(requirements),
    "@@OUTPUT_ARCHIVE@@": shell.quote(archive.path),
    "@@ENTRYPOINT@@": shell.quote(ctx.attr.entrypoint),
  }
  script = ctx.actions.declare_file(ctx.label.name + ".sh")
  ctx.actions.expand_template(
      template = ctx.file._template,
      output = script,
      substitutions = substitutions,
      is_executable = False,
  )
  inputs.append(script)

  ctx.actions.run(
     inputs = inputs,
     outputs = [archive],
     progress_message = "Creating code archive for Cloud Function %s" % archive.short_path,
     executable = script,
  )

  runfiles = ctx.runfiles(
        ctx.attr.dep.files.to_list() + 
        ctx.attr.requirements_file.files.to_list())

  return [
      DefaultInfo(
          files = depset([archive]),
          runfiles = runfiles,
      ),
  ]



py_cloud_function_src = rule(
   implementation = _py_cloud_function_src_impl,
   attrs = {
     'dep': attr.label(mandatory = True),
     'requirements_file': attr.label(mandatory = True, allow_files = True),
     'entrypoint': attr.string(mandatory = True),
     "_template": attr.label(
          default = ":package_cf.sh",
          allow_single_file = True,
          executable = True,
          cfg = 'host',
      ),
   },
)

def cf_deploy(name = "cf_deploy", 
              dep="", 
              registry=DEFAULT_GCP_LOCATION + "-docker.pkg.dev",
              project_id=GCP_PROJECT,
              source_bucket=DEFAULT_GCP_CF_LOCATION,
              entrypoint="",
              runtime="",
              tag="dev",
              **kwargs):

  py_cloud_function_src(
    name = "%s-tar" % name,
    dep = dep,
    requirements_file = "requirements.txt",
    entrypoint = entrypoint,
  )

  oci_image(
    name = name + "-image",
    base = "@ubuntu",
    cmd = [],
    env = {},
    tars = [":%s-tar" % name],
  )

  oci_push(
    name = name + "-push",
    image = name + "-image",
    repository = "{registry}/{project_id}/{repository}/{name}".format(
      registry=registry,
      project_id=project_id,
      repository=source_bucket,
      name=name),
    remote_tags = [tag]
  )

  _cf_deploy(name = name + "-deploy-sh",
             sha_dep = ":%s-image.digest" % name, 
             project_id = project_id,
             location = DEFAULT_GCP_LOCATION,
             function = name,
             runtime = "python312",
             entrypoint = entrypoint,
             repository = source_bucket,
             **kwargs)

  _cf_deploy(name = name + "-local-deploy-sh",
             local_tar = ":%s-tar" % name,
             sha_dep = ":%s-image.digest" % name, 
             project_id = project_id,
             location = DEFAULT_GCP_LOCATION,
             function = name,
             runtime = "python312",
             entrypoint = entrypoint,
             repository = source_bucket,
             **kwargs)

  _cf_deploy(name = name + "-emulate-deploy-sh",
             emulate = "1",
             local_tar = ":%s-tar" % name,
             sha_dep = ":%s-image.digest" % name, 
             project_id = project_id,
             location = DEFAULT_GCP_LOCATION,
             function = name,
             runtime = "python312",
             entrypoint = entrypoint,
             repository = source_bucket,
             **kwargs)

  native.sh_binary(
    name = "%s-deploy" % name,
    srcs = [":%s-deploy-sh" % name],
    data = [":%s-image.digest" % name],
  )

  native.sh_binary(
    name = "%s-local-deploy" % name,
    srcs = [":%s-local-deploy-sh" % name],
    data = [":%s-tar" % name],
  )

  native.sh_binary(
    name = "%s-emulate-deploy" % name,
    srcs = [":%s-emulate-deploy-sh" % name],
    data = [":%s-tar" % name],
  )

