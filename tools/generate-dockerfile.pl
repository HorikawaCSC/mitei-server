#!/usr/bin/perl

use strict;
use utf8;

my $latest_tag = (exec_command('git describe --abbrev=0'))[0];

if($latest_tag =~ /fatal/) {
  print "Failed to get latest tag\n";
  die;
}

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
