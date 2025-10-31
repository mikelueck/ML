load("@bazel_gazelle//:deps.bzl", "go_repository")

def go_dependencies():
    go_repository(
        name = "co_honnef_go_tools",
        importpath = "honnef.co/go/tools",
        sum = "h1:/hemPrYIhOhy8zYrNj+069zDB68us2sMGsfkFJO0iZs=",
        version = "v0.0.0-20190523083050-ea95bdfd59fc",
    )
    go_repository(
        name = "com_github_antonlindstrom_pgstore",
        importpath = "github.com/antonlindstrom/pgstore",
        sum = "h1:grN4CYLduV1d9SYBSYrAMPVf57cxEa7KhenvwOXTktw=",
        version = "v0.0.0-20200229204646-b08ebf1105e0",
    )
    go_repository(
        name = "com_github_auth0_go_jwt_middleware_v2",
        importpath = "github.com/auth0/go-jwt-middleware/v2",
        sum = "h1:4QREj6cS3d8dS05bEm443jhnqQF97FX9sMBeWqnNRzE=",
        version = "v2.3.0",
    )
    go_repository(
        name = "com_github_boj_redistore",
        importpath = "github.com/boj/redistore",
        sum = "h1:RmdPFa+slIr4SCBg4st/l/vZWVe9QJKMXGO60Bxbe04=",
        version = "v0.0.0-20180917114910-cd5dcc76aeff",
    )
    go_repository(
        name = "com_github_bos_hieu_mongostore",
        importpath = "github.com/bos-hieu/mongostore",
        sum = "h1:RS2CLzHoRmI/6Cz+sldlva9lJxICHS6odDOGpoFgbUE=",
        version = "v0.0.2",
    )
    go_repository(
        name = "com_github_bradfitz_gomemcache",
        importpath = "github.com/bradfitz/gomemcache",
        sum = "h1:L/QXpzIa3pOvUGt1D1lA5KjYhPBAN/3iWdP7xeFS9F0=",
        version = "v0.0.0-20190913173617-a41fca850d0b",
    )
    go_repository(
        name = "com_github_bradleypeabody_gorilla_sessions_memcache",
        importpath = "github.com/bradleypeabody/gorilla-sessions-memcache",
        sum = "h1:4QHxgr7hM4gVD8uOwrk8T1fjkKRLwaLjmTkU0ibhZKU=",
        version = "v0.0.0-20181103040241-659414f458e1",
    )
    go_repository(
        name = "com_github_burntsushi_toml",
        importpath = "github.com/BurntSushi/toml",
        sum = "h1:WXkYYl6Yr3qBf1K79EBnL4mak0OimBfB0XUf9Vl28OQ=",
        version = "v0.3.1",
    )
    go_repository(
        name = "com_github_bytedance_sonic",
        importpath = "github.com/bytedance/sonic",
        sum = "h1:6iJ6NqdoxCDr6mbY8h18oSO+cShGSMRGCEo7F2h0x8s=",
        version = "v1.9.1",
    )
    go_repository(
        name = "com_github_census_instrumentation_opencensus_proto",
        importpath = "github.com/census-instrumentation/opencensus-proto",
        sum = "h1:iKLQ0xPNFxR/2hzXZMrBo8f1j86j5WHzznCCQxV/b8g=",
        version = "v0.4.1",
    )
    go_repository(
        name = "com_github_cespare_xxhash_v2",
        importpath = "github.com/cespare/xxhash/v2",
        sum = "h1:DC2CZ1Ep5Y4k3ZQ899DldepgrayRUGE6BBZ/cd9Cj44=",
        version = "v2.2.0",
    )
    go_repository(
        name = "com_github_chenzhuoyu_base64x",
        importpath = "github.com/chenzhuoyu/base64x",
        sum = "h1:qSGYFH7+jGhDF8vLC+iwCD4WpbV1EBDSzWkJODFLams=",
        version = "v0.0.0-20221115062448-fe3a3abad311",
    )
    go_repository(
        name = "com_github_client9_misspell",
        importpath = "github.com/client9/misspell",
        sum = "h1:ta993UF76GwbvJcIo3Y68y/M3WxlpEHPWIGDkJYwzJI=",
        version = "v0.3.4",
    )
    go_repository(
        name = "com_github_cncf_udpa_go",
        importpath = "github.com/cncf/udpa/go",
        sum = "h1:WBZRG4aNOuI15bLRrCgN8fCq8E5Xuty6jGbmSNEvSsU=",
        version = "v0.0.0-20191209042840-269d4d468f6f",
    )
    go_repository(
        name = "com_github_cncf_xds_go",
        importpath = "github.com/cncf/xds/go",
        sum = "h1:DBmgJDC9dTfkVyGgipamEh2BpGYxScCH1TOF1LL1cXc=",
        version = "v0.0.0-20240318125728-8a4994d93e50",
    )
    go_repository(
        name = "com_github_coreos_go_oidc_v3",
        importpath = "github.com/coreos/go-oidc/v3",
        sum = "h1:s3e30r6VEl3/M7DTSCEuImmrfu1/1WBgA0cXkdzkrAY=",
        version = "v3.8.0",
    )
    go_repository(
        name = "com_github_davecgh_go_spew",
        importpath = "github.com/davecgh/go-spew",
        sum = "h1:vj9j/u1bqnvCEfJOwUhtlOARqs3+rkHYY13jYWTU97c=",
        version = "v1.1.1",
    )
    go_repository(
        name = "com_github_envoyproxy_go_control_plane",
        importpath = "github.com/envoyproxy/go-control-plane",
        sum = "h1:4X+VP1GHd1Mhj6IB5mMeGbLCleqxjletLK6K0rbxyZI=",
        version = "v0.12.0",
    )
    go_repository(
        name = "com_github_envoyproxy_protoc_gen_validate",
        importpath = "github.com/envoyproxy/protoc-gen-validate",
        sum = "h1:gVPz/FMfvh57HdSJQyvBtF00j8JU4zdyUgIUNhlgg0A=",
        version = "v1.0.4",
    )
    go_repository(
        name = "com_github_felixge_httpsnoop",
        importpath = "github.com/felixge/httpsnoop",
        sum = "h1:NFTV2Zj1bL4mc9sqWACXbQFVBBg2W3GPvqp8/ESS2Wg=",
        version = "v1.0.4",
    )
    go_repository(
        name = "com_github_gabriel_vasile_mimetype",
        importpath = "github.com/gabriel-vasile/mimetype",
        sum = "h1:w5qFW6JKBz9Y393Y4q372O9A7cUSequkh1Q7OhCmWKU=",
        version = "v1.4.2",
    )
    go_repository(
        name = "com_github_gin_contrib_sessions",
        importpath = "github.com/gin-contrib/sessions",
        sum = "h1:CATtfHmLMQrMNpJRgzjWXD7worTh7g7ritsQfmF+0jE=",
        version = "v0.0.5",
    )
    go_repository(
        name = "com_github_gin_contrib_sse",
        importpath = "github.com/gin-contrib/sse",
        sum = "h1:Y/yl/+YNO8GZSjAhjMsSuLt29uWRFHdHYUb5lYOV9qE=",
        version = "v0.1.0",
    )
    go_repository(
        name = "com_github_gin_gonic_gin",
        importpath = "github.com/gin-gonic/gin",
        sum = "h1:4idEAncQnU5cB7BeOkPtxjfCSye0AAm1R0RVIqJ+Jmg=",
        version = "v1.9.1",
    )
    go_repository(
        name = "com_github_globalsign_mgo",
        importpath = "github.com/globalsign/mgo",
        sum = "h1:DujepqpGd1hyOd7aW59XpK7Qymp8iy83xq74fLr21is=",
        version = "v0.0.0-20181015135952-eeefdecb41b8",
    )
    go_repository(
        name = "com_github_go_jose_go_jose_v3",
        importpath = "github.com/go-jose/go-jose/v3",
        sum = "h1:s6rrhirfEP/CGIoc6p+PZAeogN2SxKav6Wp7+dyMWVo=",
        version = "v3.0.0",
    )
    go_repository(
        name = "com_github_go_logr_logr",
        importpath = "github.com/go-logr/logr",
        sum = "h1:6pFjapn8bFcIbiKo3XT4j/BhANplGihG6tvd+8rYgrY=",
        version = "v1.4.2",
    )
    go_repository(
        name = "com_github_go_logr_stdr",
        importpath = "github.com/go-logr/stdr",
        sum = "h1:hSWxHoqTgW2S2qGc0LTAI563KZ5YKYRhT3MFKZMbjag=",
        version = "v1.2.2",
    )
    go_repository(
        name = "com_github_go_playground_locales",
        importpath = "github.com/go-playground/locales",
        sum = "h1:EWaQ/wswjilfKLTECiXz7Rh+3BjFhfDFKv/oXslEjJA=",
        version = "v0.14.1",
    )
    go_repository(
        name = "com_github_go_playground_universal_translator",
        importpath = "github.com/go-playground/universal-translator",
        sum = "h1:Bcnm0ZwsGyWbCzImXv+pAJnYK9S473LQFuzCbDbfSFY=",
        version = "v0.18.1",
    )
    go_repository(
        name = "com_github_go_playground_validator_v10",
        importpath = "github.com/go-playground/validator/v10",
        sum = "h1:vgvQWe3XCz3gIeFDm/HnTIbj6UGmg/+t63MyGU2n5js=",
        version = "v10.14.0",
    )
    go_repository(
        name = "com_github_go_stack_stack",
        importpath = "github.com/go-stack/stack",
        sum = "h1:5SgMzNM5HxrEjV0ww2lTmX6E2Izsfxas4+YHWRs3Lsk=",
        version = "v1.8.0",
    )
    go_repository(
        name = "com_github_goccy_go_json",
        importpath = "github.com/goccy/go-json",
        sum = "h1:CrxCmQqYDkv1z7lO7Wbh2HN93uovUHgrECaO5ZrCXAU=",
        version = "v0.10.2",
    )
    go_repository(
        name = "com_github_golang_glog",
        importpath = "github.com/golang/glog",
        sum = "h1:uCdmnmatrKCgMBlM4rMuJZWOkPDqdbZPnrMXDY4gI68=",
        version = "v1.2.0",
    )
    go_repository(
        name = "com_github_golang_groupcache",
        importpath = "github.com/golang/groupcache",
        sum = "h1:oI5xCqsCo564l8iNU+DwB5epxmsaqB+rhGL0m5jtYqE=",
        version = "v0.0.0-20210331224755-41bb18bfe9da",
    )
    go_repository(
        name = "com_github_golang_jwt_jwt_v5",
        importpath = "github.com/golang-jwt/jwt/v5",
        sum = "h1:pv4AsKCKKZuqlgs5sUmn4x8UlGa0kEVt/puTpKx9vvo=",
        version = "v5.3.0",
    )
    go_repository(
        name = "com_github_golang_mock",
        importpath = "github.com/golang/mock",
        sum = "h1:G5FRp8JnTd7RQH5kemVNlMeyXQAztQ3mOWV95KxsXH8=",
        version = "v1.1.1",
    )
    go_repository(
        name = "com_github_golang_protobuf",
        importpath = "github.com/golang/protobuf",
        sum = "h1:i7eJL8qZTpSEXOPTxNKhASYpMn+8e5Q6AdndVa1dWek=",
        version = "v1.5.4",
    )
    go_repository(
        name = "com_github_golang_snappy",
        importpath = "github.com/golang/snappy",
        sum = "h1:yAGX7huGHXlcLOEtBnF4w7FQwA26wojNCwOYAEhLjQM=",
        version = "v0.0.4",
    )
    go_repository(
        name = "com_github_gomodule_redigo",
        importpath = "github.com/gomodule/redigo",
        sum = "h1:K/R+8tc58AaqLkqG2Ol3Qk+DR/TlNuhuh457pBFPtt0=",
        version = "v2.0.0+incompatible",
    )
    go_repository(
        name = "com_github_google_go_cmp",
        importpath = "github.com/google/go-cmp",
        sum = "h1:wk8382ETsv4JYUZwIsn6YpYiWiBsYLSJiTsyBybVuN8=",
        version = "v0.7.0",
    )
    go_repository(
        name = "com_github_google_go_pkcs11",
        importpath = "github.com/google/go-pkcs11",
        sum = "h1:PVRnTgtArZ3QQqTGtbtjtnIkzl2iY2kt24yqbrf7td8=",
        version = "v0.3.0",
    )
    go_repository(
        name = "com_github_google_martian_v3",
        importpath = "github.com/google/martian/v3",
        sum = "h1:DIhPTQrbPkgs2yJYdXU/eNACCG5DVQjySNRNlflZ9Fc=",
        version = "v3.3.3",
    )
    go_repository(
        name = "com_github_google_s2a_go",
        importpath = "github.com/google/s2a-go",
        sum = "h1:LGD7gtMgezd8a/Xak7mEWL0PjoTQFvpRudN895yqKW0=",
        version = "v0.1.9",
    )
    go_repository(
        name = "com_github_google_uuid",
        importpath = "github.com/google/uuid",
        sum = "h1:NIvaJDMOsjHA8n1jAhLSgzrAzy1Hgr+hNrb57e+94F0=",
        version = "v1.6.0",
    )
    go_repository(
        name = "com_github_googleapis_enterprise_certificate_proxy",
        importpath = "github.com/googleapis/enterprise-certificate-proxy",
        sum = "h1:GW/XbdyBFQ8Qe+YAmFU9uHLo7OnF5tL52HFAgMmyrf4=",
        version = "v0.3.6",
    )
    go_repository(
        name = "com_github_googleapis_gax_go_v2",
        build_file_proto_mode = "disable_global",
        importpath = "github.com/googleapis/gax-go/v2",
        sum = "h1:yitjD5f7jQHhyDsnhKEBU52NdvvdSeGzlAnDPT0hH1s=",
        version = "v2.13.0",
    )
    go_repository(
        name = "com_github_gorilla_context",
        importpath = "github.com/gorilla/context",
        sum = "h1:AWwleXJkX/nhcU9bZSnZoi3h/qGYqQAGhq6zZe/aQW8=",
        version = "v1.1.1",
    )
    go_repository(
        name = "com_github_gorilla_securecookie",
        importpath = "github.com/gorilla/securecookie",
        sum = "h1:miw7JPhV+b/lAHSXz4qd/nN9jRiAFV5FwjeKyCS8BvQ=",
        version = "v1.1.1",
    )
    go_repository(
        name = "com_github_gorilla_sessions",
        importpath = "github.com/gorilla/sessions",
        sum = "h1:DHd3rPN5lE3Ts3D8rKkQ8x/0kqfeNmBAaiSi+o7FsgI=",
        version = "v1.2.1",
    )
    go_repository(
        name = "com_github_gorilla_websocket",
        importpath = "github.com/gorilla/websocket",
        sum = "h1:saDtZ6Pbx/0u+bgYQ3q96pZgCzfhKXGPqt7kZ72aNNg=",
        version = "v1.5.3",
    )
    go_repository(
        name = "com_github_jinzhu_inflection",
        importpath = "github.com/jinzhu/inflection",
        sum = "h1:K317FqzuhWc8YvSVlFMCCUb36O/S9MCKRDI7QkRKD/E=",
        version = "v1.0.0",
    )
    go_repository(
        name = "com_github_jinzhu_now",
        importpath = "github.com/jinzhu/now",
        sum = "h1:g39TucaRWyV3dwDO++eEc6qf8TVIQ/Da48WmqjZ3i7E=",
        version = "v1.1.1",
    )
    go_repository(
        name = "com_github_joho_godotenv",
        importpath = "github.com/joho/godotenv",
        sum = "h1:7eLL/+HRGLY0ldzfGMeQkb7vMd0as4CfYvUVzLqw0N0=",
        version = "v1.5.1",
    )
    go_repository(
        name = "com_github_json_iterator_go",
        importpath = "github.com/json-iterator/go",
        sum = "h1:PV8peI4a0ysnczrg+LtxykD8LfKY9ML6u2jnxaEnrnM=",
        version = "v1.1.12",
    )
    go_repository(
        name = "com_github_kidstuff_mongostore",
        importpath = "github.com/kidstuff/mongostore",
        sum = "h1:TLCm7HR+P9HM2NXaAJaIiHerOUMedtFJeAfaYwZ8YhY=",
        version = "v0.0.0-20181113001930-e650cd85ee4b",
    )
    go_repository(
        name = "com_github_klauspost_compress",
        importpath = "github.com/klauspost/compress",
        sum = "h1:P76CopJELS0TiO2mebmnzgWaajssP/EszplttgQxcgc=",
        version = "v1.13.6",
    )
    go_repository(
        name = "com_github_klauspost_cpuid_v2",
        importpath = "github.com/klauspost/cpuid/v2",
        sum = "h1:acbojRNwl3o09bUq+yDCtZFc1aiwaAAxtcn8YkZXnvk=",
        version = "v2.2.4",
    )
    go_repository(
        name = "com_github_kr_pretty",
        importpath = "github.com/kr/pretty",
        sum = "h1:flRD4NNwYAUpkphVc1HcthR4KEIFJ65n8Mw5qdRn3LE=",
        version = "v0.3.1",
    )
    go_repository(
        name = "com_github_kr_text",
        importpath = "github.com/kr/text",
        sum = "h1:5Nx0Ya0ZqY2ygV366QzturHI13Jq95ApcVaJBhpS+AY=",
        version = "v0.2.0",
    )
    go_repository(
        name = "com_github_leodido_go_urn",
        importpath = "github.com/leodido/go-urn",
        sum = "h1:XlAE/cm/ms7TE/VMVoduSpNBoyc2dOxHs5MZSwAN63Q=",
        version = "v1.2.4",
    )
    go_repository(
        name = "com_github_lib_pq",
        importpath = "github.com/lib/pq",
        sum = "h1:v9QZf2Sn6AmjXtQeFpdoq/eaNtYP6IN+7lcrygsIAtg=",
        version = "v1.10.3",
    )
    go_repository(
        name = "com_github_mattn_go_isatty",
        importpath = "github.com/mattn/go-isatty",
        sum = "h1:JITubQf0MOLdlGRuRq+jtsDlekdYPia9ZFsB8h/APPA=",
        version = "v0.0.19",
    )
    go_repository(
        name = "com_github_mattn_go_sqlite3",
        importpath = "github.com/mattn/go-sqlite3",
        sum = "h1:gXHsfypPkaMZrKbD5209QV9jbUTJKjyR5WD3HYQSd+U=",
        version = "v2.0.3+incompatible",
    )
    go_repository(
        name = "com_github_memcachier_mc",
        importpath = "github.com/memcachier/mc",
        sum = "h1:s8EDz0xrJLP8goitwZOoq1vA/sm0fPS4X3KAF0nyhWQ=",
        version = "v2.0.1+incompatible",
    )
    go_repository(
        name = "com_github_modern_go_concurrent",
        importpath = "github.com/modern-go/concurrent",
        sum = "h1:TRLaZ9cD/w8PVh93nsPXa1VrQ6jlwL5oN8l14QlcNfg=",
        version = "v0.0.0-20180306012644-bacd9c7ef1dd",
    )
    go_repository(
        name = "com_github_modern_go_reflect2",
        importpath = "github.com/modern-go/reflect2",
        sum = "h1:xBagoLtFs94CBntxluKeaWgTMpvLxC4ur3nMaC9Gz0M=",
        version = "v1.0.2",
    )
    go_repository(
        name = "com_github_pelletier_go_toml_v2",
        importpath = "github.com/pelletier/go-toml/v2",
        sum = "h1:0ctb6s9mE31h0/lhu+J6OPmVeDxJn+kYnJc2jZR9tGQ=",
        version = "v2.0.8",
    )
    go_repository(
        name = "com_github_pkg_errors",
        importpath = "github.com/pkg/errors",
        sum = "h1:FEBLx1zS214owpjy7qsBeixbURkuhQAwrK5UwLGTwt4=",
        version = "v0.9.1",
    )
    go_repository(
        name = "com_github_pmezard_go_difflib",
        importpath = "github.com/pmezard/go-difflib",
        sum = "h1:4DBwDE0NGyQoBHbLQYPwSUPoCMWR5BEzIk/f1lZbAQM=",
        version = "v1.0.0",
    )
    go_repository(
        name = "com_github_prometheus_client_model",
        importpath = "github.com/prometheus/client_model",
        sum = "h1:gQz4mCbXsO+nc9n1hCxHcGA3Zx3Eo+UHZoInFGUIXNM=",
        version = "v0.0.0-20190812154241-14fe0d1b01d4",
    )
    go_repository(
        name = "com_github_quasoft_memstore",
        importpath = "github.com/quasoft/memstore",
        sum = "h1:aUNXCGgukb4gtY99imuIeoh8Vr0GSwAlYxPAhqZrpFc=",
        version = "v0.0.0-20191010062613-2bce066d2b0b",
    )
    go_repository(
        name = "com_github_rogpeppe_go_internal",
        importpath = "github.com/rogpeppe/go-internal",
        sum = "h1:KvO1DLK/DRN07sQ1LQKScxyZJuNnedQ5/wKSR38lUII=",
        version = "v1.13.1",
    )
    go_repository(
        name = "com_github_stretchr_objx",
        importpath = "github.com/stretchr/objx",
        sum = "h1:1zr/of2m5FGMsad5YfcqgdqdWrIhu+EBEJRhR1U7z/c=",
        version = "v0.5.0",
    )
    go_repository(
        name = "com_github_stretchr_testify",
        importpath = "github.com/stretchr/testify",
        sum = "h1:Xv5erBjTwe/5IxqUQTdXv5kgmIvbHo3QQyRwhJsOfJA=",
        version = "v1.10.0",
    )
    go_repository(
        name = "com_github_thedatashed_xlsxreader",
        importpath = "github.com/thedatashed/xlsxreader",
        sum = "h1:8aGbkXIPEThQbA8KzUZqIa4v4oqFrJFKLQ36vWePI5U=",
        version = "v1.2.8",
    )
    go_repository(
        name = "com_github_twitchyliquid64_golang_asm",
        importpath = "github.com/twitchyliquid64/golang-asm",
        sum = "h1:SU5vSMR7hnwNxj24w34ZyCi/FmDZTkS4MhqMhdFk5YI=",
        version = "v0.15.1",
    )
    go_repository(
        name = "com_github_ugorji_go_codec",
        importpath = "github.com/ugorji/go/codec",
        sum = "h1:BMaWp1Bb6fHwEtbplGBGJ498wD+LKlNSl25MjdZY4dU=",
        version = "v1.2.11",
    )
    go_repository(
        name = "com_github_wader_gormstore_v2",
        importpath = "github.com/wader/gormstore/v2",
        sum = "h1:Idfd68RXNFibVmkNKgNv8l7BobUfyvwEm1gvWqeA/Yw=",
        version = "v2.0.0",
    )
    go_repository(
        name = "com_github_xdg_go_pbkdf2",
        importpath = "github.com/xdg-go/pbkdf2",
        sum = "h1:Su7DPu48wXMwC3bs7MCNG+z4FhcyEuz5dlvchbq0B0c=",
        version = "v1.0.0",
    )
    go_repository(
        name = "com_github_xdg_go_scram",
        importpath = "github.com/xdg-go/scram",
        sum = "h1:akYIkZ28e6A96dkWNJQu3nmCzH3YfwMPQExUYDaRv7w=",
        version = "v1.0.2",
    )
    go_repository(
        name = "com_github_xdg_go_stringprep",
        importpath = "github.com/xdg-go/stringprep",
        sum = "h1:6iq84/ryjjeRmMJwxutI51F2GIPlP5BfTvXHeYjyhBc=",
        version = "v1.0.2",
    )
    go_repository(
        name = "com_github_youmark_pkcs8",
        importpath = "github.com/youmark/pkcs8",
        sum = "h1:splanxYIlg+5LfHAM6xpdFEAYOk8iySO56hMFq6uLyA=",
        version = "v0.0.0-20181117223130-1be2e3e5546d",
    )
    go_repository(
        name = "com_google_cloud_go",
        importpath = "cloud.google.com/go",
        sum = "h1:Jo0SM9cQnSkYfp44+v+NQXHpcHqlnRJk2qxh6yvxxxQ=",
        version = "v0.115.1",
    )
    go_repository(
        name = "com_google_cloud_go_accessapproval",
        importpath = "cloud.google.com/go/accessapproval",
        sum = "h1:MgtE8CI+YJWPGGHnxQ9z1VQqV87h+vSGy2MeM/m0ggQ=",
        version = "v1.7.11",
    )
    go_repository(
        name = "com_google_cloud_go_accesscontextmanager",
        importpath = "cloud.google.com/go/accesscontextmanager",
        sum = "h1:IQ3KLJmNKPgstN0ZcRw0niU4KfsiOZmzvcGCF+NT618=",
        version = "v1.8.11",
    )
    go_repository(
        name = "com_google_cloud_go_aiplatform",
        importpath = "cloud.google.com/go/aiplatform",
        sum = "h1:EPPqgHDJpBZKRvv+OsB3cr0jYz3EL2pZ+802rBPcG8U=",
        version = "v1.68.0",
    )
    go_repository(
        name = "com_google_cloud_go_analytics",
        importpath = "cloud.google.com/go/analytics",
        sum = "h1:BY8ZY7hQwKBi+lNp1IkiMTOK4xe4lxZCeYv3S9ARXtE=",
        version = "v0.23.6",
    )
    go_repository(
        name = "com_google_cloud_go_apigateway",
        importpath = "cloud.google.com/go/apigateway",
        sum = "h1:VtEvpnqqY2T5gZBzo+p7C87yGH3omHUkPIbRQkmGS9I=",
        version = "v1.6.11",
    )
    go_repository(
        name = "com_google_cloud_go_apigeeconnect",
        importpath = "cloud.google.com/go/apigeeconnect",
        sum = "h1:CftZgGXFRLJeD2/5ZIdWuAMxW/88UG9tHhRPI/NY75M=",
        version = "v1.6.11",
    )
    go_repository(
        name = "com_google_cloud_go_apigeeregistry",
        importpath = "cloud.google.com/go/apigeeregistry",
        sum = "h1:3vLwk0tS9L++6ZyV4RDH4UCydfVoqxJbpWvqG6MTtUw=",
        version = "v0.8.9",
    )
    go_repository(
        name = "com_google_cloud_go_appengine",
        importpath = "cloud.google.com/go/appengine",
        sum = "h1:ZLoWWwakgRzRnXX2bsgk2g1sdzti3wq+ebunTJsZNog=",
        version = "v1.8.11",
    )
    go_repository(
        name = "com_google_cloud_go_area120",
        importpath = "cloud.google.com/go/area120",
        sum = "h1:UID1dl7lW2zs8OpYVtVZ5WsXU9kUcxC1nd3nnToHW70=",
        version = "v0.8.11",
    )
    go_repository(
        name = "com_google_cloud_go_artifactregistry",
        importpath = "cloud.google.com/go/artifactregistry",
        sum = "h1:NNK4vYVA5NGQmbmYidfJhnfmYU6SSSRUM2oopNouJNs=",
        version = "v1.14.13",
    )
    go_repository(
        name = "com_google_cloud_go_asset",
        importpath = "cloud.google.com/go/asset",
        sum = "h1:/R2XZS6lR8oj/Y3L+epD2yy7mf44Zp62H4xZ4vzaR/Y=",
        version = "v1.19.5",
    )
    go_repository(
        name = "com_google_cloud_go_assuredworkloads",
        importpath = "cloud.google.com/go/assuredworkloads",
        sum = "h1:pwZp9o8aF5QmX4Z0YNlRe1ZOUzDw0UALmkem3aPobZc=",
        version = "v1.11.11",
    )
    go_repository(
        name = "com_google_cloud_go_auth",
        importpath = "cloud.google.com/go/auth",
        sum = "h1:cYhKl1JUhynmxjXfrk4qdPc6Amw7i+GC9VLflgT0p5M=",
        version = "v0.9.0",
    )
    go_repository(
        name = "com_google_cloud_go_auth_oauth2adapt",
        importpath = "cloud.google.com/go/auth/oauth2adapt",
        sum = "h1:0GWE/FUsXhf6C+jAkWgYm7X9tK8cuEIfy19DBn6B6bY=",
        version = "v0.2.4",
    )
    go_repository(
        name = "com_google_cloud_go_automl",
        importpath = "cloud.google.com/go/automl",
        sum = "h1:FBCLjGS+Did/wtRHqyS055bRs/EJXx3meTvHPcdZgk8=",
        version = "v1.13.11",
    )
    go_repository(
        name = "com_google_cloud_go_baremetalsolution",
        importpath = "cloud.google.com/go/baremetalsolution",
        sum = "h1:VvBiXT9QJ4VpNVyfzHhLScY1aymZxpQgOa20yUvgphw=",
        version = "v1.2.10",
    )
    go_repository(
        name = "com_google_cloud_go_batch",
        importpath = "cloud.google.com/go/batch",
        sum = "h1:o1RAjc0ExGAAm41YB9LbJZyJDgZR4M6SKyITsd/Smr4=",
        version = "v1.9.2",
    )
    go_repository(
        name = "com_google_cloud_go_beyondcorp",
        importpath = "cloud.google.com/go/beyondcorp",
        sum = "h1:K4blSIQZn3YO4F4LmvWrH52pb8Y0L3NOrwkf22+x67M=",
        version = "v1.0.10",
    )
    go_repository(
        name = "com_google_cloud_go_bigquery",
        importpath = "cloud.google.com/go/bigquery",
        sum = "h1:SYEA2f7fKqbSRRBHb7g0iHTtZvtPSPYdXfmqsjpsBwo=",
        version = "v1.62.0",
    )
    go_repository(
        name = "com_google_cloud_go_bigtable",
        importpath = "cloud.google.com/go/bigtable",
        sum = "h1:OF+V7OrVPhsXy++iTHewE4VD1kv6ikWQJbRIiq1/Kjc=",
        version = "v1.27.2-0.20240730134218-123c88616251",
    )
    go_repository(
        name = "com_google_cloud_go_billing",
        importpath = "cloud.google.com/go/billing",
        sum = "h1:sGRWx7PvsfHuZyx151Xr6CrORIgjvCMO4GRabihSdQQ=",
        version = "v1.18.9",
    )
    go_repository(
        name = "com_google_cloud_go_binaryauthorization",
        importpath = "cloud.google.com/go/binaryauthorization",
        sum = "h1:ItT9uR/0/ok2Ru3LCcbSIBUPsKqTA49ZmxCupqQaeFo=",
        version = "v1.8.7",
    )
    go_repository(
        name = "com_google_cloud_go_certificatemanager",
        importpath = "cloud.google.com/go/certificatemanager",
        sum = "h1:ASC9N81NU8JnGzi9kiY2QTqtTgOziwGv48sjt3YG420=",
        version = "v1.8.5",
    )
    go_repository(
        name = "com_google_cloud_go_channel",
        importpath = "cloud.google.com/go/channel",
        sum = "h1:AkKyMl2pSoJxBQtjAd6LYOtMgOaCl/kuiKoSg/Gf/H4=",
        version = "v1.17.11",
    )
    go_repository(
        name = "com_google_cloud_go_cloudbuild",
        importpath = "cloud.google.com/go/cloudbuild",
        sum = "h1:RvK5r8JBCLNg9XmfGPy05t3bmhLJV3Xh3sDHGHAATgM=",
        version = "v1.16.5",
    )
    go_repository(
        name = "com_google_cloud_go_clouddms",
        importpath = "cloud.google.com/go/clouddms",
        sum = "h1:EA3y9v5TZiAlwgHJh2vPOEelqYiCxXBYZRCNnGK5q+g=",
        version = "v1.7.10",
    )
    go_repository(
        name = "com_google_cloud_go_cloudtasks",
        importpath = "cloud.google.com/go/cloudtasks",
        sum = "h1:p91Brp4nJkyRRI/maYdO+FT+e9tU+2xoGr20s2rvalU=",
        version = "v1.12.12",
    )
    go_repository(
        name = "com_google_cloud_go_compute",
        importpath = "cloud.google.com/go/compute",
        sum = "h1:XM8ulx6crjdl09XBfji7viFgZOEQuIxBwKmjRH9Rtmc=",
        version = "v1.27.4",
    )
    go_repository(
        name = "com_google_cloud_go_compute_metadata",
        importpath = "cloud.google.com/go/compute/metadata",
        sum = "h1:A6hENjEsCDtC1k8byVsgwvVcioamEHvZ4j01OwKxG9I=",
        version = "v0.6.0",
    )
    go_repository(
        name = "com_google_cloud_go_contactcenterinsights",
        importpath = "cloud.google.com/go/contactcenterinsights",
        sum = "h1:LRcI5RAlLIbjwT312sGt+gyXcaXTr+v7uEQlNyArO9g=",
        version = "v1.13.6",
    )
    go_repository(
        name = "com_google_cloud_go_container",
        importpath = "cloud.google.com/go/container",
        sum = "h1:GP5zLamfvPZeOTifnGBSER/br76D5eJ97xhcXXrh5tM=",
        version = "v1.38.0",
    )
    go_repository(
        name = "com_google_cloud_go_containeranalysis",
        importpath = "cloud.google.com/go/containeranalysis",
        sum = "h1:Xb8Eu7vVmWR5nAl5WPTGTx/dCr+R+oF7VbuYV47EHHs=",
        version = "v0.12.1",
    )
    go_repository(
        name = "com_google_cloud_go_datacatalog",
        importpath = "cloud.google.com/go/datacatalog",
        sum = "h1:Cosg/L60myEbpP1HoNv77ykV7zWe7hqSwY4uUDmhx/I=",
        version = "v1.20.5",
    )
    go_repository(
        name = "com_google_cloud_go_dataflow",
        importpath = "cloud.google.com/go/dataflow",
        sum = "h1:YIhStasKFDESaUdpnsHsp/5bACYL/yvW0OuZ6zPQ6nY=",
        version = "v0.9.11",
    )
    go_repository(
        name = "com_google_cloud_go_dataform",
        importpath = "cloud.google.com/go/dataform",
        sum = "h1:oNtTx9PdH7aPnvrKIsPrh+Y6Mw+8Bw5/ZgLWVHAev/c=",
        version = "v0.9.8",
    )
    go_repository(
        name = "com_google_cloud_go_datafusion",
        importpath = "cloud.google.com/go/datafusion",
        sum = "h1:GVcVisjVKmoj1eNnIp3G3qjjo+7koHr0Kf8tF6Cjqe0=",
        version = "v1.7.11",
    )
    go_repository(
        name = "com_google_cloud_go_datalabeling",
        importpath = "cloud.google.com/go/datalabeling",
        sum = "h1:7jSuJEAc7upeMmyICzqfU0OyxUV38JSWW+8r5GmoHX0=",
        version = "v0.8.11",
    )
    go_repository(
        name = "com_google_cloud_go_dataplex",
        importpath = "cloud.google.com/go/dataplex",
        sum = "h1:bIU1r1YnsX6P1qTnaRnah/STHoLJ3EHUZVCjJl2+1Eo=",
        version = "v1.18.2",
    )
    go_repository(
        name = "com_google_cloud_go_dataproc_v2",
        importpath = "cloud.google.com/go/dataproc/v2",
        sum = "h1:OgTfUARkF8AfkNmoyT0wyLLXNh4LbT3l55s5gUlvFOk=",
        version = "v2.5.3",
    )
    go_repository(
        name = "com_google_cloud_go_dataqna",
        importpath = "cloud.google.com/go/dataqna",
        sum = "h1:bEUidOYRS0EQ7qHbZtcnospuks72iTapboszXU9poz8=",
        version = "v0.8.11",
    )
    go_repository(
        name = "com_google_cloud_go_datastore",
        importpath = "cloud.google.com/go/datastore",
        sum = "h1:6Me8ugrAOAxssGhSo8im0YSuy4YvYk4mbGvCadAH5aE=",
        version = "v1.17.1",
    )
    go_repository(
        name = "com_google_cloud_go_datastream",
        importpath = "cloud.google.com/go/datastream",
        sum = "h1:klGhjQCLoLIRHMzMFIqM73cPNKliGveqC+Vrms+ce6A=",
        version = "v1.10.10",
    )
    go_repository(
        name = "com_google_cloud_go_deploy",
        importpath = "cloud.google.com/go/deploy",
        sum = "h1:nQfMNeCPPSCrAUrG9AYAbiwxIK2+snTkVWW17AfCSwo=",
        version = "v1.20.0",
    )
    go_repository(
        name = "com_google_cloud_go_dialogflow",
        build_directives = [
            "gazelle:resolve go google.golang.org/genproto/googleapis/api/annotations @org_golang_google_genproto//googleapis/api/annotations",  # keep
            "gazelle:resolve go google.golang.org/genproto/googleapis/api @org_golang_google_genproto//googleapis/api",  # keep
        ],
        importpath = "cloud.google.com/go/dialogflow",
        sum = "h1:s4lhL0DZExduaN534Rl3K488sKkes7LHnDQtbpwFHNk=",
        version = "v1.56.0",
    )
    go_repository(
        name = "com_google_cloud_go_dlp",
        importpath = "cloud.google.com/go/dlp",
        sum = "h1:U0/IWY/X8b7tg4yTHYTcTs86FA9esshHYSutYWDOGgg=",
        version = "v1.15.0",
    )
    go_repository(
        name = "com_google_cloud_go_documentai",
        importpath = "cloud.google.com/go/documentai",
        sum = "h1:AUwiPqALsAkY2WYdr5BqmGrdMGDeeY1GFjd+ilkpexA=",
        version = "v1.30.5",
    )
    go_repository(
        name = "com_google_cloud_go_domains",
        importpath = "cloud.google.com/go/domains",
        sum = "h1:8peNiXtaMNIF9Wybci859M/yprFcEve1R2z08pErUBs=",
        version = "v0.9.11",
    )
    go_repository(
        name = "com_google_cloud_go_edgecontainer",
        importpath = "cloud.google.com/go/edgecontainer",
        sum = "h1:wTo0ulZDSsDzeoVjICJZjZMzZ1Nn9y//AwAQlXbaTbs=",
        version = "v1.2.5",
    )
    go_repository(
        name = "com_google_cloud_go_errorreporting",
        importpath = "cloud.google.com/go/errorreporting",
        sum = "h1:E/gLk+rL7u5JZB9oq72iL1bnhVlLrnfslrgcptjJEUE=",
        version = "v0.3.1",
    )
    go_repository(
        name = "com_google_cloud_go_essentialcontacts",
        importpath = "cloud.google.com/go/essentialcontacts",
        sum = "h1:JaQXS+qCFYs8yectfZHpzw4+NjTvFqTuDMCtfPzMvbw=",
        version = "v1.6.12",
    )
    go_repository(
        name = "com_google_cloud_go_eventarc",
        importpath = "cloud.google.com/go/eventarc",
        sum = "h1:HVJmOVc+7eVFAqMpJRrq0nY0KlYBEBVZW7Gz7TxTio8=",
        version = "v1.13.10",
    )
    go_repository(
        name = "com_google_cloud_go_filestore",
        importpath = "cloud.google.com/go/filestore",
        sum = "h1:LF9t5MClPyFJMuXdez/AjF1uyO9xHKUFF3GUqA+xFPI=",
        version = "v1.8.7",
    )
    go_repository(
        name = "com_google_cloud_go_firestore",
        build_directives = [
            "gazelle:resolve go google.golang.org/genproto/googleapis/api/annotations @org_golang_google_genproto//googleapis/api/annotations",  # keep
            "gazelle:resolve go google.golang.org/genproto/googleapis/api @org_golang_google_genproto//googleapis/api",  # keep
        ],
        importpath = "cloud.google.com/go/firestore",
        sum = "h1:YwmDHcyrxVRErWcgxunzEaZxtNbc8QoFYA/JOEwDPgc=",
        version = "v1.16.0",
    )
    go_repository(
        name = "com_google_cloud_go_functions",
        importpath = "cloud.google.com/go/functions",
        sum = "h1:tPe3/48RpjcFk96VeB6jOKQpK8nliGJLsgjh6pUOyFQ=",
        version = "v1.16.6",
    )
    go_repository(
        name = "com_google_cloud_go_gkebackup",
        importpath = "cloud.google.com/go/gkebackup",
        sum = "h1:mufh0PNpvqbfLV+TcxzSGESX8jGBcjKgctldv7kwQns=",
        version = "v1.5.4",
    )
    go_repository(
        name = "com_google_cloud_go_gkeconnect",
        importpath = "cloud.google.com/go/gkeconnect",
        sum = "h1:4bZAzvqhuv1uP+i4yG9cEMQ6ggdP26nBVjUgroPU6IM=",
        version = "v0.8.11",
    )
    go_repository(
        name = "com_google_cloud_go_gkehub",
        importpath = "cloud.google.com/go/gkehub",
        sum = "h1:hQkVCcOiW/vPVYsthvKl1nje430/TpdFfgeIuqcYVOA=",
        version = "v0.14.11",
    )
    go_repository(
        name = "com_google_cloud_go_gkemulticloud",
        importpath = "cloud.google.com/go/gkemulticloud",
        sum = "h1:6zV05tyl37HoEjCGGY+zHFNxnKQCjvVpiqWAUVgGaEs=",
        version = "v1.2.4",
    )
    go_repository(
        name = "com_google_cloud_go_gsuiteaddons",
        importpath = "cloud.google.com/go/gsuiteaddons",
        sum = "h1:zydWX0nVT0Ut/P1X25Sy+4Rqe2PH04IzhwlF1BJd8To=",
        version = "v1.6.11",
    )
    go_repository(
        name = "com_google_cloud_go_iam",
        build_directives = [
            "gazelle:resolve go google.golang.org/genproto/googleapis/api/annotations @org_golang_google_genproto//googleapis/api/annotations",  # keep
            "gazelle:resolve go google.golang.org/genproto/googleapis/api @org_golang_google_genproto//googleapis/api",  # keep
        ],
        importpath = "cloud.google.com/go/iam",
        sum = "h1:JixGLimRrNGcxvJEQ8+clfLxPlbeZA6MuRJ+qJNQ5Xw=",
        version = "v1.1.12",
    )
    go_repository(
        name = "com_google_cloud_go_iap",
        importpath = "cloud.google.com/go/iap",
        sum = "h1:j7jQqqSkZ2nWAOCiyaZfnJ+REycTJ2NP2dUEjLoW4aA=",
        version = "v1.9.10",
    )
    go_repository(
        name = "com_google_cloud_go_ids",
        importpath = "cloud.google.com/go/ids",
        sum = "h1:JhlR1d0XhMsj6YmSmbLbbXV5CGkffnUkPj0HNxJYNtc=",
        version = "v1.4.11",
    )
    go_repository(
        name = "com_google_cloud_go_iot",
        importpath = "cloud.google.com/go/iot",
        sum = "h1:UBqSUZA6+7bM+mv6uvhl8tVsyT2Fi50njtBFRbrKSlI=",
        version = "v1.7.11",
    )
    go_repository(
        name = "com_google_cloud_go_kms",
        importpath = "cloud.google.com/go/kms",
        sum = "h1:dYN3OCsQ6wJLLtOnI8DGUwQ5shMusXsWCCC+s09ATsk=",
        version = "v1.18.4",
    )
    go_repository(
        name = "com_google_cloud_go_language",
        importpath = "cloud.google.com/go/language",
        sum = "h1:zzN4QifNRII72H+M0KemHclpuO4fEL7W67hgVJVwKoU=",
        version = "v1.12.9",
    )
    go_repository(
        name = "com_google_cloud_go_lifesciences",
        importpath = "cloud.google.com/go/lifesciences",
        sum = "h1:xyPSYICJWZElcELYgWCKs5PltyNX3TzOKaQAZA7d/I0=",
        version = "v0.9.11",
    )
    go_repository(
        name = "com_google_cloud_go_logging",
        importpath = "cloud.google.com/go/logging",
        sum = "h1:v3ktVzXMV7CwHq1MBF65wcqLMA7i+z3YxbUsoK7mOKs=",
        version = "v1.11.0",
    )
    go_repository(
        name = "com_google_cloud_go_longrunning",
        build_directives = [
            "gazelle:resolve go google.golang.org/genproto/googleapis/api/annotations @org_golang_google_genproto//googleapis/api/annotations",  # keep
            "gazelle:resolve go google.golang.org/genproto/googleapis/api @org_golang_google_genproto//googleapis/api",  # keep
        ],
        importpath = "cloud.google.com/go/longrunning",
        sum = "h1:5LqSIdERr71CqfUsFlJdBpOkBH8FBCFD7P1nTWy3TYE=",
        version = "v0.5.12",
    )
    go_repository(
        name = "com_google_cloud_go_managedidentities",
        importpath = "cloud.google.com/go/managedidentities",
        sum = "h1:YU6NtRRBX5R1f3a8ryqhh1dUb1/pt3rnhSO50b63yZY=",
        version = "v1.6.11",
    )
    go_repository(
        name = "com_google_cloud_go_maps",
        importpath = "cloud.google.com/go/maps",
        sum = "h1:XgSh470MFdCgUY+6Oj2LTxYqSyzLgKFb9b7hwSlg1nw=",
        version = "v1.11.5",
    )
    go_repository(
        name = "com_google_cloud_go_mediatranslation",
        importpath = "cloud.google.com/go/mediatranslation",
        sum = "h1:QvO405ocKTmcJqjfqL1zps08yrKk8rE+0E1ZNSWfjbw=",
        version = "v0.8.11",
    )
    go_repository(
        name = "com_google_cloud_go_memcache",
        importpath = "cloud.google.com/go/memcache",
        sum = "h1:DGPEJOVL4Qix2GLKQKcgzGpNLD7gAnCFLr9ch9YSIhU=",
        version = "v1.10.11",
    )
    go_repository(
        name = "com_google_cloud_go_metastore",
        importpath = "cloud.google.com/go/metastore",
        sum = "h1:E5eAxzIRoVP0DrV+ZtTLMYkkjSs4fcfsbL7wv1mXV2U=",
        version = "v1.13.10",
    )
    go_repository(
        name = "com_google_cloud_go_monitoring",
        importpath = "cloud.google.com/go/monitoring",
        sum = "h1:v/7MXFxYrhXLEZ9sSfwXdlTLLB/xrU7xTyYjY5acynQ=",
        version = "v1.20.3",
    )
    go_repository(
        name = "com_google_cloud_go_networkconnectivity",
        importpath = "cloud.google.com/go/networkconnectivity",
        sum = "h1:2EE8pKiv1AI8fBdZCdiUjNgQ+TaBgwE4GxIze4fDdY0=",
        version = "v1.14.10",
    )
    go_repository(
        name = "com_google_cloud_go_networkmanagement",
        importpath = "cloud.google.com/go/networkmanagement",
        sum = "h1:6TGn7ZZXyj5rloN0vv5Aw0awYbfbheNRg8BKroT7/2g=",
        version = "v1.13.6",
    )
    go_repository(
        name = "com_google_cloud_go_networksecurity",
        importpath = "cloud.google.com/go/networksecurity",
        sum = "h1:6wUzyHCwDEOkDbAJjT6jxsAi+vMfe3aj2JWwqSFVXOQ=",
        version = "v0.9.11",
    )
    go_repository(
        name = "com_google_cloud_go_notebooks",
        importpath = "cloud.google.com/go/notebooks",
        sum = "h1:c8I0EaLGqStRmvX29L7jb4mOrpigxn1mGyBt65OdS0s=",
        version = "v1.11.9",
    )
    go_repository(
        name = "com_google_cloud_go_optimization",
        importpath = "cloud.google.com/go/optimization",
        sum = "h1:++U21U9LWFdgnnVFaq4kDeOafft6gI/CHzsiJ173c6U=",
        version = "v1.6.9",
    )
    go_repository(
        name = "com_google_cloud_go_orchestration",
        importpath = "cloud.google.com/go/orchestration",
        sum = "h1:xfczjtNDabsXTnDySAwD/TMfDSkcxEgH1rxfS6BVQtM=",
        version = "v1.9.6",
    )
    go_repository(
        name = "com_google_cloud_go_orgpolicy",
        importpath = "cloud.google.com/go/orgpolicy",
        sum = "h1:StymaN9vS7949m15Nwgf5aKd9yaRtzWJ4VqHdbXcOEM=",
        version = "v1.12.7",
    )
    go_repository(
        name = "com_google_cloud_go_osconfig",
        importpath = "cloud.google.com/go/osconfig",
        sum = "h1:IbbTg7jtTEn4+iEJwgbCYck5NLMOc2eKrqVpQb7Xx6c=",
        version = "v1.13.2",
    )
    go_repository(
        name = "com_google_cloud_go_oslogin",
        importpath = "cloud.google.com/go/oslogin",
        sum = "h1:q9x7tjKtfBpXMpiJKwb5UyhMA3GrwmJHvx56uCEuS8M=",
        version = "v1.13.7",
    )
    go_repository(
        name = "com_google_cloud_go_phishingprotection",
        importpath = "cloud.google.com/go/phishingprotection",
        sum = "h1:3Kr7TINZ+8pbdWe3JnJf9c84ibz60NRTvwLdVtI3SK8=",
        version = "v0.8.11",
    )
    go_repository(
        name = "com_google_cloud_go_policytroubleshooter",
        importpath = "cloud.google.com/go/policytroubleshooter",
        sum = "h1:EHXkBYgHQtVH8P41G2xxmQbMwQh+o5ggno8l3/9CXaA=",
        version = "v1.10.9",
    )
    go_repository(
        name = "com_google_cloud_go_privatecatalog",
        importpath = "cloud.google.com/go/privatecatalog",
        sum = "h1:t8dJpQf22H6COeDvp7TDl7+KuwLT6yVmqAVRIUIUj6U=",
        version = "v0.9.11",
    )
    go_repository(
        name = "com_google_cloud_go_pubsub",
        importpath = "cloud.google.com/go/pubsub",
        sum = "h1:0LdP+zj5XaPAGtWr2V6r88VXJlmtaB/+fde1q3TU8M0=",
        version = "v1.40.0",
    )
    go_repository(
        name = "com_google_cloud_go_pubsublite",
        importpath = "cloud.google.com/go/pubsublite",
        sum = "h1:jLQozsEVr+c6tOU13vDugtnaBSUy/PD5zK6mhm+uF1Y=",
        version = "v1.8.2",
    )
    go_repository(
        name = "com_google_cloud_go_recaptchaenterprise_v2",
        importpath = "cloud.google.com/go/recaptchaenterprise/v2",
        sum = "h1:80Mx0i3uyv5dPNUYsNPFk9GJ+19AmTlnWnXFCTC9NkI=",
        version = "v2.14.2",
    )
    go_repository(
        name = "com_google_cloud_go_recommendationengine",
        importpath = "cloud.google.com/go/recommendationengine",
        sum = "h1:STJYdA/e/MAh2ZSdjss5YE/d0t0nt0WotBF9V0pgpPQ=",
        version = "v0.8.11",
    )
    go_repository(
        name = "com_google_cloud_go_recommender",
        importpath = "cloud.google.com/go/recommender",
        sum = "h1:asEAoj4a3inPCdH8nbPaZDJWhR/xwfKi4tuSmIlaS2I=",
        version = "v1.12.7",
    )
    go_repository(
        name = "com_google_cloud_go_redis",
        importpath = "cloud.google.com/go/redis",
        sum = "h1:9CO6EcuM9/CpgtcjG6JZV+GFw3oDrRfwLwmvwo/uM1o=",
        version = "v1.16.4",
    )
    go_repository(
        name = "com_google_cloud_go_resourcemanager",
        importpath = "cloud.google.com/go/resourcemanager",
        sum = "h1:N8CmqszjKNOgJnrQVsg+g8VWIEGgcwsD5rPiay9cMC4=",
        version = "v1.9.11",
    )
    go_repository(
        name = "com_google_cloud_go_resourcesettings",
        importpath = "cloud.google.com/go/resourcesettings",
        sum = "h1:1VwLfvJi8QtGrKPwuisGqr6gcgaCSR6A57wIvN+fqkM=",
        version = "v1.7.4",
    )
    go_repository(
        name = "com_google_cloud_go_retail",
        importpath = "cloud.google.com/go/retail",
        sum = "h1:YJgpBwCarAPqzaJS8ycIhyn2sAQT1RhTJRiTVBjtJAI=",
        version = "v1.17.4",
    )
    go_repository(
        name = "com_google_cloud_go_run",
        importpath = "cloud.google.com/go/run",
        sum = "h1:ai1rnbX92iPqWg9MrbDbebsxlUSAiOK6N9dEDDQeVA0=",
        version = "v1.4.0",
    )
    go_repository(
        name = "com_google_cloud_go_scheduler",
        importpath = "cloud.google.com/go/scheduler",
        sum = "h1:8BxDXoHCcsAe2fXsvFrkBbTxgl+5JBrIy1+/HRS0nxY=",
        version = "v1.10.12",
    )
    go_repository(
        name = "com_google_cloud_go_secretmanager",
        build_directives = [
            "gazelle:resolve go google.golang.org/genproto/googleapis/api/annotations @org_golang_google_genproto//googleapis/api/annotations",  # keep
            "gazelle:resolve go google.golang.org/genproto/googleapis/api @org_golang_google_genproto//googleapis/api",  # keep
        ],
        importpath = "cloud.google.com/go/secretmanager",
        sum = "h1:tXlHvpm97mFD0Lv50N4U4zlXfkoTNay3BmpNA/W7/oI=",
        version = "v1.13.5",
    )
    go_repository(
        name = "com_google_cloud_go_security",
        importpath = "cloud.google.com/go/security",
        sum = "h1:ERhxAa02mnMEIIAXvzje+qJ+yWniP6l5uOX+k9ELCaA=",
        version = "v1.17.4",
    )
    go_repository(
        name = "com_google_cloud_go_securitycenter",
        importpath = "cloud.google.com/go/securitycenter",
        sum = "h1:K+jfFUTum2jl//uWCN+QKkKXRgidxTyGfGTqXPyDvUY=",
        version = "v1.33.1",
    )
    go_repository(
        name = "com_google_cloud_go_servicedirectory",
        importpath = "cloud.google.com/go/servicedirectory",
        sum = "h1:8Ky2lY0CWJJIIlsc+rKTn6C3SqOuVEwT3brDC6TJCjk=",
        version = "v1.11.11",
    )
    go_repository(
        name = "com_google_cloud_go_shell",
        importpath = "cloud.google.com/go/shell",
        sum = "h1:RobTXyL33DQITYQh//KJ9GjS4bsdj4fGmm2rkb/ywzM=",
        version = "v1.7.11",
    )
    go_repository(
        name = "com_google_cloud_go_spanner",
        importpath = "cloud.google.com/go/spanner",
        sum = "h1:XK15cs9lFFQo5n4Wh9nfrcPXAxWln6NdodDiQKmoD08=",
        version = "v1.65.0",
    )
    go_repository(
        name = "com_google_cloud_go_speech",
        importpath = "cloud.google.com/go/speech",
        sum = "h1:3j+WpeBY57C0FDJxg317vpKgOLjL/kNxlcNPGSqXkqE=",
        version = "v1.24.0",
    )
    go_repository(
        name = "com_google_cloud_go_storage",
        importpath = "cloud.google.com/go/storage",
        sum = "h1:CcxnSohZwizt4LCzQHWvBf1/kvtHUn7gk9QERXPyXFs=",
        version = "v1.43.0",
    )
    go_repository(
        name = "com_google_cloud_go_storagetransfer",
        importpath = "cloud.google.com/go/storagetransfer",
        sum = "h1:GfxaYqX+kwlrSrJAENNmRTCGmSTgvouvS3XhgwKpOT8=",
        version = "v1.10.10",
    )
    go_repository(
        name = "com_google_cloud_go_talent",
        importpath = "cloud.google.com/go/talent",
        sum = "h1:JN721EjG+UTfHVVaMhyxwKCCJPjUc8PiS0RnW/7kWfE=",
        version = "v1.6.12",
    )
    go_repository(
        name = "com_google_cloud_go_texttospeech",
        importpath = "cloud.google.com/go/texttospeech",
        sum = "h1:jzko1ahItjLYEWr6n3lTIoBSinD1JzavEuDzYLWZNko=",
        version = "v1.7.11",
    )
    go_repository(
        name = "com_google_cloud_go_tpu",
        importpath = "cloud.google.com/go/tpu",
        sum = "h1:uMrwnK05cocNt3OOp+mZ16xlvIKaXUt3QUXkUbG4LdM=",
        version = "v1.6.11",
    )
    go_repository(
        name = "com_google_cloud_go_trace",
        importpath = "cloud.google.com/go/trace",
        sum = "h1:+Y1emOgcyGy6OdJ2KQbT4t2oecPp49GtJn8j3GM1pWo=",
        version = "v1.10.11",
    )
    go_repository(
        name = "com_google_cloud_go_translate",
        importpath = "cloud.google.com/go/translate",
        sum = "h1:W16MpZ2Z3TWoHbNHmyHz9As276lGVTSwxRcquv454R0=",
        version = "v1.10.7",
    )
    go_repository(
        name = "com_google_cloud_go_video",
        importpath = "cloud.google.com/go/video",
        sum = "h1:+FTZi7NtT4FV2Y1j3zC3zYjaRrlGqKsZpbLweredEWM=",
        version = "v1.22.0",
    )
    go_repository(
        name = "com_google_cloud_go_videointelligence",
        importpath = "cloud.google.com/go/videointelligence",
        sum = "h1:zl8xijOEavernn/t6mZZ4fg0pIVc2yquHH73oj0Leo4=",
        version = "v1.11.11",
    )
    go_repository(
        name = "com_google_cloud_go_vision_v2",
        importpath = "cloud.google.com/go/vision/v2",
        sum = "h1:HyFEUXQa0SvlF0LASCn/x+juNCH4kIXQrUqi6SIcYvE=",
        version = "v2.8.6",
    )
    go_repository(
        name = "com_google_cloud_go_vmmigration",
        importpath = "cloud.google.com/go/vmmigration",
        sum = "h1:yqwkTPpvSw9dUfnl9/APAVrwO9UW1jJZtgbZpNQ+WdU=",
        version = "v1.7.11",
    )
    go_repository(
        name = "com_google_cloud_go_vmwareengine",
        importpath = "cloud.google.com/go/vmwareengine",
        sum = "h1:9Fjn/RoeOMo8UQt1TbXmmw7rJApC26BqnISAI1AERcc=",
        version = "v1.2.0",
    )
    go_repository(
        name = "com_google_cloud_go_vpcaccess",
        importpath = "cloud.google.com/go/vpcaccess",
        sum = "h1:1XgRP+Q2X6MvE/xnexpQ7ydgav+IO5UcKUIJEbL65J8=",
        version = "v1.7.11",
    )
    go_repository(
        name = "com_google_cloud_go_webrisk",
        importpath = "cloud.google.com/go/webrisk",
        sum = "h1:2qwEqnXrToIv2Y4xvsUSxCk7R2Ki+3W2+GNyrytoKTQ=",
        version = "v1.9.11",
    )
    go_repository(
        name = "com_google_cloud_go_websecurityscanner",
        importpath = "cloud.google.com/go/websecurityscanner",
        sum = "h1:r3ePI3YN7ujwX8c9gIkgbVjYVwP4yQA4X2z6P7+HNxI=",
        version = "v1.6.11",
    )
    go_repository(
        name = "com_google_cloud_go_workflows",
        importpath = "cloud.google.com/go/workflows",
        sum = "h1:EGJeZmwgE71jxFOI5s9iKST2Bivif3DSzlqVbiXACXQ=",
        version = "v1.12.10",
    )
    go_repository(
        name = "in_gopkg_check_v1",
        importpath = "gopkg.in/check.v1",
        sum = "h1:Hei/4ADfdWqJk1ZMxUNpqntNwaWcugrBjAiHlqqRiVk=",
        version = "v1.0.0-20201130134442-10cb98267c6c",
    )
    go_repository(
        name = "in_gopkg_go_jose_go_jose_v2",
        importpath = "gopkg.in/go-jose/go-jose.v2",
        sum = "h1:nt80fvSDlhKWQgSWyHyy5CfmlQr+asih51R8PTWNKKs=",
        version = "v2.6.3",
    )
    go_repository(
        name = "in_gopkg_yaml_v2",
        importpath = "gopkg.in/yaml.v2",
        sum = "h1:obN1ZagJSUGI0Ek/LBmuj4SNLPfIny3KsKFopxRdj10=",
        version = "v2.2.8",
    )
    go_repository(
        name = "in_gopkg_yaml_v3",
        importpath = "gopkg.in/yaml.v3",
        sum = "h1:fxVm/GzAzEWqLHuvctI91KS9hhNmmWOoWu0XTYJS7CA=",
        version = "v3.0.1",
    )
    go_repository(
        name = "io_gorm_driver_sqlite",
        importpath = "gorm.io/driver/sqlite",
        sum = "h1:PDzwYE+sI6De2+mxAneV9Xs11+ZyKV6oxD3wDGkaNvM=",
        version = "v1.1.4",
    )
    go_repository(
        name = "io_gorm_gorm",
        importpath = "gorm.io/gorm",
        sum = "h1:ebZ5KrSHzet+sqOCVdH9mTjW91L298nX3v5lVxAzSUY=",
        version = "v1.20.12",
    )
    go_repository(
        name = "io_opencensus_go",
        importpath = "go.opencensus.io",
        sum = "h1:y73uSU6J157QMP2kn2r30vwW1A2W2WFwSCGnAVxeaD0=",
        version = "v0.24.0",
    )
    go_repository(
        name = "io_opentelemetry_go_auto_sdk",
        importpath = "go.opentelemetry.io/auto/sdk",
        sum = "h1:cH53jehLUN6UFLY71z+NDOiNJqDdPRaXzTel0sJySYA=",
        version = "v1.1.0",
    )
    go_repository(
        name = "io_opentelemetry_go_contrib_instrumentation_google_golang_org_grpc_otelgrpc",
        importpath = "go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc",
        sum = "h1:vS1Ao/R55RNV4O7TA2Qopok8yN+X0LIP6RVWLFkprck=",
        version = "v0.52.0",
    )
    go_repository(
        name = "io_opentelemetry_go_contrib_instrumentation_net_http_otelhttp",
        importpath = "go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp",
        sum = "h1:sbiXRNDSWJOTobXh5HyQKjq6wUC5tNybqjIqDpAY4CU=",
        version = "v0.60.0",
    )
    go_repository(
        name = "io_opentelemetry_go_otel",
        importpath = "go.opentelemetry.io/otel",
        sum = "h1:xKWKPxrxB6OtMCbmMY021CqC45J+3Onta9MqjhnusiQ=",
        version = "v1.35.0",
    )
    go_repository(
        name = "io_opentelemetry_go_otel_metric",
        importpath = "go.opentelemetry.io/otel/metric",
        sum = "h1:0znxYu2SNyuMSQT4Y9WDWej0VpcsxkuklLa4/siN90M=",
        version = "v1.35.0",
    )
    go_repository(
        name = "io_opentelemetry_go_otel_sdk",
        importpath = "go.opentelemetry.io/otel/sdk",
        sum = "h1:iPctf8iprVySXSKJffSS79eOjl9pvxV9ZqOWT0QejKY=",
        version = "v1.35.0",
    )
    go_repository(
        name = "io_opentelemetry_go_otel_sdk_metric",
        importpath = "go.opentelemetry.io/otel/sdk/metric",
        sum = "h1:1RriWBmCKgkeHEhM7a2uMjMUfP7MsOF5JpUCaEqEI9o=",
        version = "v1.35.0",
    )
    go_repository(
        name = "io_opentelemetry_go_otel_trace",
        importpath = "go.opentelemetry.io/otel/trace",
        sum = "h1:dPpEfJu1sDIqruz7BHFG3c7528f6ddfSWfFDVt/xgMs=",
        version = "v1.35.0",
    )
    go_repository(
        name = "org_golang_google_api",
        importpath = "google.golang.org/api",
        sum = "h1:PljqpNAfZaaSpS+TnANfnNAXKdzHM/B9bKhwRlo7JP0=",
        version = "v0.192.0",
    )
    go_repository(
        name = "org_golang_google_appengine",
        importpath = "google.golang.org/appengine",
        sum = "h1:IhEN5q69dyKagZPYMSdIjS2HqprW324FRQZJcGqPAsM=",
        version = "v1.6.8",
    )
    go_repository(
        name = "org_golang_google_genproto",
        importpath = "google.golang.org/genproto",
        sum = "h1:OqdXDEakZCVtDiZTjcxfwbHPCT11ycCEsTKesBVKvyY=",
        version = "v0.0.0-20240730163845-b1a4ccb954bf",
    )
    go_repository(
        name = "org_golang_google_genproto_googleapis_api",
        importpath = "google.golang.org/genproto/googleapis/api",
        sum = "h1:b1Ln/PG8orm0SsBbHZWke8dDp2lrCD4jSmfglFpTZbk=",
        version = "v0.0.0-20240725223205-93522f1f2a9f",
    )
    go_repository(
        name = "org_golang_google_genproto_googleapis_bytestream",
        importpath = "google.golang.org/genproto/googleapis/bytestream",
        sum = "h1:T4tsZBlZYXK3j40sQNP5MBO32I+rn6ypV1PpklsiV8k=",
        version = "v0.0.0-20240730163845-b1a4ccb954bf",
    )
    go_repository(
        name = "org_golang_google_genproto_googleapis_rpc",
        importpath = "google.golang.org/genproto/googleapis/rpc",
        sum = "h1:h6p3mQqrmT1XkHVTfzLdNz1u7IhINeZkz67/xTbOuWs=",
        version = "v0.0.0-20250428153025-10db94c68c34",
    )
    go_repository(
        name = "org_golang_google_grpc",
        importpath = "google.golang.org/grpc",
        sum = "h1:LKtvyfbX3UGVPFcGqJ9ItpVWW6oN/2XqTxfAnwRRXiA=",
        version = "v1.64.1",
    )
    go_repository(
        name = "org_golang_google_protobuf",
        importpath = "google.golang.org/protobuf",
        sum = "h1:z1NpPI8ku2WgiWnf+t9wTPsn6eP1L7ksHUlkfLvd9xY=",
        version = "v1.36.6",
    )
    go_repository(
        name = "org_golang_x_arch",
        importpath = "golang.org/x/arch",
        sum = "h1:02VY4/ZcO/gBOH6PUaoiptASxtXU10jazRCP865E97k=",
        version = "v0.3.0",
    )
    go_repository(
        name = "org_golang_x_crypto",
        importpath = "golang.org/x/crypto",
        sum = "h1:kJNSjF/Xp7kU0iB2Z+9viTPMW4EqqsrywMXLJOOsXSE=",
        version = "v0.37.0",
    )
    go_repository(
        name = "org_golang_x_exp",
        importpath = "golang.org/x/exp",
        sum = "h1:c2HOrn5iMezYjSlGPncknSEr/8x5LELb/ilJbXi9DEA=",
        version = "v0.0.0-20190121172915-509febef88a4",
    )
    go_repository(
        name = "org_golang_x_lint",
        importpath = "golang.org/x/lint",
        sum = "h1:XQyxROzUlZH+WIQwySDgnISgOivlhjIEwaQaJEJrrN0=",
        version = "v0.0.0-20190313153728-d0100b6bd8b3",
    )
    go_repository(
        name = "org_golang_x_mod",
        importpath = "golang.org/x/mod",
        sum = "h1:zY54UmvipHiNd+pm+m0x9KhZ9hl1/7QNMyxXbc6ICqA=",
        version = "v0.17.0",
    )
    go_repository(
        name = "org_golang_x_net",
        importpath = "golang.org/x/net",
        sum = "h1:ZCu7HMWDxpXpaiKdhzIfaltL9Lp31x/3fCP11bc6/fY=",
        version = "v0.39.0",
    )
    go_repository(
        name = "org_golang_x_oauth2",
        importpath = "golang.org/x/oauth2",
        sum = "h1:dnDm7JmhM45NNpd8FDDeLhK6FwqbOf4MLCM9zb1BOHI=",
        version = "v0.30.0",
    )
    go_repository(
        name = "org_golang_x_sync",
        importpath = "golang.org/x/sync",
        sum = "h1:woo0S4Yywslg6hp4eUFjTVOyKt0RookbpAHG4c1HmhQ=",
        version = "v0.14.0",
    )
    go_repository(
        name = "org_golang_x_sys",
        importpath = "golang.org/x/sys",
        sum = "h1:s77OFDvIQeibCmezSnk/q6iAfkdiQaJi4VzroCFrN20=",
        version = "v0.32.0",
    )
    go_repository(
        name = "org_golang_x_term",
        importpath = "golang.org/x/term",
        sum = "h1:erwDkOK1Msy6offm1mOgvspSkslFnIGsFnxOKoufg3o=",
        version = "v0.31.0",
    )
    go_repository(
        name = "org_golang_x_text",
        importpath = "golang.org/x/text",
        sum = "h1:dd5Bzh4yt5KYA8f9CJHCP4FB4D51c2c6JvN37xJJkJ0=",
        version = "v0.24.0",
    )
    go_repository(
        name = "org_golang_x_time",
        importpath = "golang.org/x/time",
        sum = "h1:/bpjEDfN9tkoN/ryeYHnv5hcMlc8ncjMcM4XBk5NWV0=",
        version = "v0.11.0",
    )
    go_repository(
        name = "org_golang_x_tools",
        importpath = "golang.org/x/tools",
        sum = "h1:vU5i/LfpvrRCpgM/VPfJLg5KjxD3E+hfT1SH+d9zLwg=",
        version = "v0.21.1-0.20240508182429-e35e4ccd0d2d",
    )
    go_repository(
        name = "org_golang_x_xerrors",
        importpath = "golang.org/x/xerrors",
        sum = "h1:E7g+9GITq07hpfrRu66IVDexMakfv52eLZ2CXBWiKr4=",
        version = "v0.0.0-20191204190536-9bdfabe68543",
    )
    go_repository(
        name = "org_mongodb_go_mongo_driver",
        importpath = "go.mongodb.org/mongo-driver",
        sum = "h1:f3aLGJvQmBl8d9S40IL+jEyBC6hfLPbJjv9t5hEM9ck=",
        version = "v1.9.0",
    )
