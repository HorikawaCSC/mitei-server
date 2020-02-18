#!/usr/bin/perl

use strict;
use utf8;

my $title = $ENV{PR_TITLE};

if(!$title or $title !~ /^Release version: v([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+)?$/) {
  die "Not semver revision";
}

my $version = $title;
$version =~ s/^Release version: //g;

print "Target version: $version\n";

my @tags = exec_command('git tag');
if(scalar(grep { $_ eq $version } @tags) > 0) {
  die "Tag already found";
}

if($ENV{CHECK_ONLY}) {
  exit;
}

$version =~ s/^v//;

system("npx", "lerna", "version", "$version", "--yes", "--allow-branch", "*") == 0 or die;

sub exec_command {
  my $command = shift;
  open(my $stdout, "$command 2>&1 |");
  my @result = <$stdout>;
  close($stdout);
  return @result;
}
