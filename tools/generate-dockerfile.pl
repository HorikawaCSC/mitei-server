#!/usr/bin/perl

use strict;
use utf8;

my @versions = exec_command('npx lerna list -lp');

my $latest_tag = undef;
foreach(@versions) {
  $latest_tag = $1 if $_ =~ m|\@mitei/server-media:(.+)|;
}

die "No version available" unless $latest_tag;

print "Latest version: $latest_tag\n";

$latest_tag =~ s/^v//;

open(my $tmpl, './tools/Dockerfile.tmpl') or die "Failed to open template Dockerfile";
open(my $output, '> ./Dockerfile') or die "Failed to open Dockerfile";
while(<$tmpl>) {
  chomp;
  $_ =~ s/{VERSION}/$latest_tag/;
  print $output "$_\n";
}
close($output);
close($tmpl);

sub exec_command {
  my $command = shift;
  open(my $stdout, "$command 2>&1 |");
  my @result = <$stdout>;
  close($stdout);
  return @result;
}
