def gofmt_test(name = "gofmt", srcs = []):
    srcs = native.glob(["*.go"])
    rules = {"%s-file%d" % (name, hash(s)): s for s in srcs}
    for rulename, src in rules.items():
        cmd = """
      export TMPDIR=.
      out=$$(gofmt -l $<)

      if [ -n "$$out" ]; then
        echo "gmfmt failed:"
        echo "gofmt -w $$out"
        exit 1
      fi
      md5 $< > $@
    """
        native.genrule(
            name = rulename,
            cmd_bash = cmd,
            srcs = [src],
            outs = ["%s.md5" % rulename],
            tools = [],
            visibility = ["//visibility:private"],
        )

    native.sh_test(
        name = name + "_test",
        srcs = ["//rules:build_test.sh"],
        data = rules.keys(),
        visibility = ["//visibility:public"],
    )
