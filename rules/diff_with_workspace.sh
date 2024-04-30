#!/usr/bin/env bash

# This is used for testing that changes in a *.proto file have been replicated in
# the generated files in the source tree.
# This will fail a command like `bazel test //chat/proto:snapshot_test`
# The output of the failure will show the commands to run to fix the failure

cmds=@@CONTENT@@

failures=()
commands=()

#Set the field separator to new line
IFS=$'\n'
for cmd in $cmds
do
  IFS=' ' cmd_parts=( $cmd )
  file=${cmd_parts[2]}
  path=""
  IFS='/' path_parts=( $file )
  IFS=" "
  for ((i=0; i<${#path_parts[@]}-1; ++i)); do
    if [ $i -gt 0 ]; then
      path="$path/"
    fi
    path="$path${path_parts[$i]}"
  done

  diff=$(eval "$cmd")
  cnt=$(eval "echo -e '$diff' | wc -l | awk '{print int(\$0)}'")
  if [ $cnt -gt 1 ]; then
    failures+=("$file")
    commands+=("//$path:snapshot")

    exit_code=1
  fi
done


if [ $exit_code > 0 ]; then

    # sort and unique our arrays

    failures=($(printf "%s\n" "${failures[@]}" | sort -u))
    commands=($(printf "%s\n" "${commands[@]}" | sort -u))

    echo "Diff failed for file(s):"

    for i in ${failures[@]}; 
    do
      echo -e "\t$i"
    done

    echo "To fix these problems please run:"
    for i in "${commands[@]}" 
    do
      RED="\e[31m"
      ENDCOLOR="\e[0m"
      printf "\t${RED}bazel run $i${ENDCOLOR}\n"
    done
fi

exit $exit_code
