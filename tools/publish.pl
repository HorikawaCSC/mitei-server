#!/usr/bin/perl

use strict;
use utf8;

system('npm', 'whoami') == 0 or die;;

my $branch = (exec_command('git branch --show-current'))[0];

if($branch =~ /fatal: /) {
  print "Failed to obtain branch\n";
  exit -1;
}

chomp $branch;

print "## Current Branch: $branch\n";

sleep 5;

if($branch =~ /release-/) {
  my $latest_tag = (exec_command('git describe --abbrev=0'))[0];
  chomp $latest_tag;
  if($latest_tag !~ /fatal/) {
    print "Tag found in $branch: $latest_tag\n";
    system("npm", "run", "publish:production") == 0 or die;
  }else{
    die "No tags";
  }
}elsif($branch =~ /develop/) {
  print "Using canary publishing\n";
  my $preid = $branch =~ /develop/ ? 'alpha' : $branch;
  $branch =~ s|.+/||;
  system("npm", "run", "publish:canary", "--", "--preid", $branch, "--force-publish") == 0 or die;
}else{
  print "Not a publishable version\n";
}

sub exec_command {
  my $command = shift;
  open(my $stdout, "$command 2>&1 |");
  my @result = <$stdout>;
  close($stdout);
  return @result;
}
