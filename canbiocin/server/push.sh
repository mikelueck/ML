bazel run //canbiocin/envoy:push -c opt
bazel run //canbiocin/server:push -c opt
bazel build  //canbiocin/client:bundle -c opt


gcloud storage rm gs://canbiocin-static-site-dev-canbiocin/index.html
gcloud storage rm gs://canbiocin-static-site-dev-canbiocin/bundle.js


gcloud storage cp ~/src/ML/bazel-bin/canbiocin/client/bundle/index.html gs://canbiocin-static-site-dev-canbiocin
gcloud storage cp ~/src/ML/bazel-bin/canbiocin/client/bundle/bundle.js gs://canbiocin-static-site-dev-canbiocin


