#!/usr/bin/env bash

set -e

yum update -y
yum install -y cpio yum-utils zip
yum install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm

pushd /tmp
yumdownloader -x \*i686 --archlist=x86_64 clamav clamav-lib clamav-update json-c pcre2 libtool-ltdl
rpm2cpio clamav-0*.rpm | cpio -idmv
rpm2cpio clamav-lib*.rpm | cpio -idmv
rpm2cpio clamav-update*.rpm | cpio -idmv
rpm2cpio json-c*.rpm | cpio -idmv
rpm2cpio pcre*.rpm | cpio -idmv
rpm2cpio libtool-ltdl*.rpm | cpio -idmv
popd

mkdir -p ./build/bin
cp /tmp/usr/bin/clamscan /tmp/usr/bin/freshclam build/bin/.

mkdir -p ./build/lib # NOTE-RT `lib` instead of `lib64` since we can rely on it being set in `LD_LIBRARY_PATH` per https://forums.aws.amazon.com/thread.jspa?messageID=706158
cp /tmp/usr/lib64/* ./build/lib/.

mkdir -p ./build/etc
echo "DatabaseMirror database.clamav.net" > ./build/etc/freshclam.conf
