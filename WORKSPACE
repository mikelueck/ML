workspace(name = "Chorus")

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

_bazel_features_version = "1.9.0"

_bazel_features_sha256 = "06f02b97b6badb3227df2141a4b4622272cdcd2951526f40a888ab5f43897f14"

http_archive(
    name = "bazel_features",
    sha256 = _bazel_features_sha256,
    strip_prefix = "bazel_features-%s" % _bazel_features_version,
    url = "https://github.com/bazel-contrib/bazel_features/releases/download/v{0}/bazel_features-v{0}.tar.gz".format(_bazel_features_version),
)

load("@bazel_features//:deps.bzl", "bazel_features_deps")

bazel_features_deps()

http_archive(
    name = "io_bazel_rules_go",
    sha256 = "80a98277ad1311dacd837f9b16db62887702e9f1d1c4c9f796d0121a46c8e184",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/rules_go/releases/download/v0.46.0/rules_go-v0.46.0.zip",
        "https://github.com/bazelbuild/rules_go/releases/download/v0.46.0/rules_go-v0.46.0.zip",
    ],
)

# use http_archive to download bazel_gazelle dependency
http_archive(
    name = "bazel_gazelle",
    integrity = "sha256-MpOL2hbmcABjA1R5Bj2dJMYO2o15/Uc5Vj9Q0zHLMgk=",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/bazel-gazelle/releases/download/v0.35.0/bazel-gazelle-v0.35.0.tar.gz",
        "https://github.com/bazelbuild/bazel-gazelle/releases/download/v0.35.0/bazel-gazelle-v0.35.0.tar.gz",
    ],
)

## rules_pkg
_rules_pkg_version = "0.10.1"

http_archive(
    name = "rules_pkg",
    sha256 = "d250924a2ecc5176808fc4c25d5cf5e9e79e6346d79d5ab1c493e289e722d1d0",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/rules_pkg/releases/download/{v}/rules_pkg-{v}.tar.gz".format(v = _rules_pkg_version),
        "https://github.com/bazelbuild/rules_pkg/releases/download/{v}/rules_pkg-{v}.tar.gz".format(v = _rules_pkg_version),
    ],
)

load("@rules_pkg//:deps.bzl", "rules_pkg_dependencies")

rules_pkg_dependencies()

# load Bazel and Gazelle rules
load("@io_bazel_rules_go//go:deps.bzl", "go_register_toolchains", "go_rules_dependencies")
load("@bazel_gazelle//:deps.bzl", "gazelle_dependencies")

go_rules_dependencies()

# We define the version of go that this project uses
go_register_toolchains(version = "1.22.0")

gazelle_dependencies()

############################################################
# Define your own dependencies here using go_repository.
# Else, dependencies declared by rules_go/gazelle will be used.
# The first declaration of an external repository "wins".
############################################################

# we are going to store the go dependecy definitions
# in a different file "deps.bzl". We can include those
# definitions in this file, but it gets quite verbose.
load("//:deps.bzl", "go_dependencies")

# gazelle:repository_macro deps.bzl%go_dependencies
go_dependencies()

# rules_oci
http_archive(
    name = "rules_oci",
    sha256 = "4a276e9566c03491649eef63f27c2816cc222f41ccdebd97d2c5159e84917c3b",
    strip_prefix = "rules_oci-1.7.4",
    url = "https://github.com/bazel-contrib/rules_oci/releases/download/v1.7.4/rules_oci-v1.7.4.tar.gz",
)

load("@rules_oci//oci:dependencies.bzl", "rules_oci_dependencies")

rules_oci_dependencies()

load("@rules_oci//oci:repositories.bzl", "LATEST_CRANE_VERSION", "oci_register_toolchains")

oci_register_toolchains(
    name = "oci",
    crane_version = LATEST_CRANE_VERSION,
)

load("@rules_oci//oci:pull.bzl", "oci_pull")

# You can pull your base images using oci_pull like this:
load("@rules_oci//oci:pull.bzl", "oci_pull")

oci_pull(
    name = "ubuntu",
    digest = "sha256:723ad8033f109978f8c7e6421ee684efb624eb5b9251b70c6788fdb2405d050b",
    image = "ubuntu",
    platforms = [
        "linux/amd64",
        "linux/arm64/v8",
    ],
)

_envoy_version = "v1.29.2"

oci_pull(
    name = "envoy",
    platforms = [
        "linux/amd64",
        "linux/arm64",
    ],
    registry = "index.docker.io",
    repository = "envoyproxy/envoy",
    tag = _envoy_version,
)

# rules_js

http_archive(
    name = "aspect_rules_js",
    sha256 = "7b2a4d1d264e105eae49a27e2e78065b23e2e45724df2251eacdd317e95bfdfd",
    strip_prefix = "rules_js-1.31.0",
    url = "https://github.com/aspect-build/rules_js/releases/download/v1.31.0/rules_js-v1.31.0.tar.gz",
)

http_archive(
    name = "aspect_rules_ts",
    sha256 = "ace5b609603d9b5b875d56c9c07182357c4ee495030f40dcefb10d443ba8c208",
    strip_prefix = "rules_ts-1.4.0",
    url = "https://github.com/aspect-build/rules_ts/releases/download/v1.4.0/rules_ts-v1.4.0.tar.gz",
)

load("@aspect_rules_js//js:repositories.bzl", "rules_js_dependencies")

rules_js_dependencies()

load("@aspect_rules_ts//ts:repositories.bzl", "rules_ts_dependencies")

rules_ts_dependencies(ts_version_from = "//:package.json")

load("@rules_nodejs//nodejs:repositories.bzl", "DEFAULT_NODE_VERSION", "nodejs_register_toolchains")

# NB: The rules_js nodejs toolchain should be named something other than "nodejs" so its name does
# not conflict with the build_bazel_rules_nodejs toolchain naming and prevent the two toolchains
# from existing side by side.
# TODO(rules_js_migration): rename to standard `nodejs` once rules_nodejs is completely removed
nodejs_register_toolchains(
    name = "nodejs_rules_js",
    node_version = DEFAULT_NODE_VERSION,
)

load("@aspect_rules_js//npm:npm_import.bzl", "npm_translate_lock")

# NB: The npm_translate_lock repository is named @npm_rules_js to not conflict with @npm from
# rules_nodejs.
# TODO(rules_js_migration): rename to standard `npm` once rules_nodejs is completely removed
npm_translate_lock(
    name = "npm_rules_js",
    bins = {
        # derived from "bin" attribute in node_modules/next/package.json
        "http-server": {
            "http-server": "./bin/http-server",
        },
    },
    npmrc = "//:.npmrc",
    pnpm_lock = "//:pnpm-lock.yaml",
    verify_node_modules_ignored = "//:.bazelignore",
)

load("@npm_rules_js//:repositories.bzl", "npm_repositories")

npm_repositories()

# Node JS
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "f02557f31d4110595ca6e93660018bcd7fdfdbe7d0086089308f1b3af3a7a7ee",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/5.8.1/rules_nodejs-5.8.1.tar.gz"],
)

load("@build_bazel_rules_nodejs//:index.bzl", "yarn_install")

yarn_install(
    name = "npm",
    package_json = "//:package.json",
    yarn_lock = "//:yarn.lock",
)

# rules_webpack
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "aspect_rules_webpack",
    sha256 = "ff7746cd5c7e8ef32d8fbccc720e37c5ec9054fbe705f3576013dbaa1fb5ad40",
    strip_prefix = "rules_webpack-0.14.0",
    url = "https://github.com/aspect-build/rules_webpack/releases/download/v0.14.0/rules_webpack-v0.14.0.tar.gz",
)

# Fetch the Bazel module dependencies

load("@aspect_rules_webpack//webpack:dependencies.bzl", "rules_webpack_dependencies")

rules_webpack_dependencies()

http_archive(
    name = "rules_proto_grpc",
    sha256 = "2a0860a336ae836b54671cbbe0710eec17c64ef70c4c5a88ccfd47ea6e3739bd",
    strip_prefix = "rules_proto_grpc-4.6.0",
    urls = [
        "https://github.com/rules-proto-grpc/rules_proto_grpc/releases/download/4.6.0/rules_proto_grpc-4.6.0.tar.gz",
    ],
)

load("@rules_proto_grpc//:repositories.bzl", "rules_proto_grpc_repos", "rules_proto_grpc_toolchains")

rules_proto_grpc_toolchains()

rules_proto_grpc_repos()

load("@rules_proto_grpc//js:repositories.bzl", rules_proto_grpc_js_repos = "js_repos")

rules_proto_grpc_js_repos()

load("@rules_proto//proto:repositories.bzl", "rules_proto_dependencies", "rules_proto_toolchains")

rules_proto_dependencies()

rules_proto_toolchains()

http_archive(
    name = "com_github_bazelbuild_buildtools",
    sha256 = "ae34c344514e08c23e90da0e2d6cb700fcd28e80c02e23e4d5715dddcb42f7b3",
    strip_prefix = "buildtools-4.2.2",
    urls = [
        "https://github.com/bazelbuild/buildtools/archive/refs/tags/4.2.2.tar.gz",
    ],
)
