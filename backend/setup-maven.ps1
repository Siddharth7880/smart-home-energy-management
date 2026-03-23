$wrapperUrl = "https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"
$wrapperDir = ".mvn/wrapper"
New-Item -ItemType Directory -Force -Path $wrapperDir
Invoke-WebRequest -Uri $wrapperUrl -OutFile "$wrapperDir/maven-wrapper.jar"

$propertiesContent = "distributionUrl=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip"
Set-Content -Path "$wrapperDir/maven-wrapper.properties" -Value $propertiesContent

$mvnwCmdUrl = "https://raw.githubusercontent.com/apache/maven-wrapper/main/mvnw.cmd"
Invoke-WebRequest -Uri $mvnwCmdUrl -OutFile "mvnw.cmd"
