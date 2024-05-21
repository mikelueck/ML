#!/usr/bin/env bash

workspace_name=@@WORKSPACE_NAME@@
zip_path=@@ZIP_PATH@@
requirements=@@REQUIREMENTS@@
output_archive=@@OUTPUT_ARCHIVE@@
module_name=@@MODULE_NAME@@
entrypoint=@@ENTRYPOINT@@

output_path=$(eval "echo $output_archive | cut -d '.' -f1")
output_real_path="$output_path/runfiles/$workspace_name"

mkdir -p $output_real_path

unzip $zip_path "runfiles/$workspace_name/**" -d $output_path >> /dev/null

cat $requirements >> $output_real_path/requirements.txt

echo "from $module_name import $entrypoint" >  $output_real_path/main.py

echo "Creating tar: $output_archive"
pushd $output_real_path > /dev/null
tmp_archive_name="archive.tar"
tar cf $tmp_archive_name * > /dev/null 
popd > /dev/null

mv $output_real_path/$tmp_archive_name $output_archive

echo "Cleaning up: $output_real_path"
rm -rf $output_real_path
