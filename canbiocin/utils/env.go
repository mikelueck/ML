package utils

import (
	"os"
)

func GetCredentialsFile() string {
	return os.Getenv("GOOGLE_APPLICATION_CREDENTIALS")
}

func GetIsDev() bool {
	return os.Getenv("DEV") != ""
}
