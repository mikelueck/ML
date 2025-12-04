load("@rules_pkg//:pkg.bzl", "pkg_tar")
load("@rules_oci//oci:defs.bzl", "oci_image", "oci_push")
load("@aspect_bazel_lib//lib:expand_template.bzl", "expand_template")

PS_AWS_ACCOUNT_ID = "040419410065"
PERSONAL_AWS_ACCOUNT_ID = "471112934317"

def go_ecr_oci(name = "ecr_oci", 
               go_binary_target=":bootstrap", 
               image_base="", # Use @aws-lambda-base-al2023 for lambda or @ubuntu
               registry="<aws_account_id>.dkr.ecr.<region>.amazonaws.com/",
               repository="", 
               aws_account_id=PERSONAL_AWS_ACCOUNT_ID,
               #aws_account_id=PS_AWS_ACCOUNT_ID,
               region="us-east-2",
               **kwargs):
  tar_name = "%s_tar" % name

  pkg_tar(
      name = tar_name,
      # This seems to be needed for ECR and Lambda to know how to handle the OCI image
      extension = "tar.gz", 
      srcs = [go_binary_target],
      package_dir = "/var/task/",
  )        

  ecr_oci_tar(name = "ecr_oci_pkg", 
              tar_target= ":%s" % tar_name,
              image_base=image_base,
              entrypoint=["/var/task/%s" % Label(go_binary_target).name],
              registry=registry,
              repository=repository,
              aws_account_id=aws_account_id,
              region=region,
              **kwargs)
            
  

def ecr_oci_tar(name = "ecr_oci", 
               tar_target="",
               image_base="", # Use @aws-lambda-base-al2023 for lambda or @ubuntu
               entrypoint=[],
               registry="<aws_account_id>.dkr.ecr.<region>.amazonaws.com/",
               repository="", 
               aws_account_id=PERSONAL_AWS_ACCOUNT_ID,
               #aws_account_id=PS_AWS_ACCOUNT_ID,
               region="us-east-2",
               **kwargs):
  if repository == "":
    repository = native.package_name()

  if image_base == "":
    print('\n########\nUSE: image_base="@aws-lambda-base-al2023" for lambda or image_base="@ubuntu\n########')

  image_name = "%s_image" % name
          
  oci_image(
      name = image_name,
      base = image_base,
      entrypoint = entrypoint,
      tars = [tar_target],
      **kwargs,
  )   
      
  stamped_name = "%s_stamped" % name
  # Use the value of --embed_label under --stamp, otherwise use a deterministic constant
  # value to ensure cache hits for actions that depend on this.
  expand_template(
      name = stamped_name,
      out = "%s_stamped.tags.txt" % name,
      template = ["0.0.0"],
      stamp_substitutions = {"0.0.0": "{{BUILD_EMBED_LABEL}}"},
  )

  repository_name = "%s_repository" % name
  expand_template(
      name = repository_name,
      out = "%s_repository.txt" % name,
      template = [registry + repository],
      substitutions = {"<aws_account_id>": aws_account_id,
                       "<region>": region,},
  )


  # To setup authentication
  # aws ecr get-login-password --region <region> --profile <profile> | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.us-east-2.amazonaws.com
  # this sets up docker to be authenticated with aws account and allows crane
  # to authenticate
  oci_push(
      name = "%s_ecr_push" % name,
      image = ":%s" % image_name,
      repository_file = ":%s" % repository_name,
      remote_tags = ":%s" % stamped_name,
  )

  print("\n######\nIf the above fails try authenticating")
  print("\n######\n\taws ecr get-login-password --region %s --profile <profile> | docker login --username AWS --password-stdin %s.dkr.ecr.%s.amazonaws.com" % (region, aws_account_id, region))
