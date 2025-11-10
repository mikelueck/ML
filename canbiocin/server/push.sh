bazel run //canbiocin/envoy:push -c opt
bazel run //canbiocin/server:push -c opt
bazel build  //canbiocin/client:bundle -c opt


gcloud storage rm gs://canbiocin-static-site-dev-canbiocin-474014/*

gcloud storage cp ~/src/ML/bazel-bin/canbiocin/client/bundle/* gs://canbiocin-static-site-dev-canbiocin-474014
gcloud storage cp ~/src/ML/bazel-bin/canbiocin/client/public/*.avif gs://canbiocin-static-site-dev-canbiocin-474014

gcloud storage cp ~/src/ML/bazel-bin/canbiocin/client/bundle/index.html gs://canbiocin-static-site-dev-canbiocin-474014 --cache-control "no-store"


