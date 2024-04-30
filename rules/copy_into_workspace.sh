#!/usr/bin/env bash

# Used for copying generated files from *.proto files into the source tree
# this is needed for IDEs to work properly as they can't resolve the symbols

cd "$BUILD_WORKSPACE_DIRECTORY"
cmd=@@CONTENT@@
eval $cmd
