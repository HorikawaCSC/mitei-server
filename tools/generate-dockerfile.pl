#!/usr/bin/perl

use strict;
use utf8;

my @versions = exec_command('npx lerna list -lp');
my $pkgprefix = '@mitei/';

my %version = ();
foreach(@versions) {
  if($_ =~ m|(${pkgprefix}[^:]+):([^:]+)$|) {
    $version{$1} = $2;
  }
}

print "Found versions of: ", join(' ', keys(%version)), "\n";

opendir(my $dir, './tools/dockerfile') or die "Failed to scan dockerfiles";
my @files = grep { $_ =~ /\.tmpl$/ } readdir($dir);
closedir($dir);

print "Found templates: ", join(' ', @files), "\n";

mkdir('./dockerfiles') unless -d './dockerfiles';

foreach(@files) {
  my $component = $_;
  $component =~ s/\.tmpl$//;

  my $component_version = $version{"$pkgprefix$component"};
  if(!$component_version) {
    die "No packages";
  }

  open(my $output, "> ./dockerfiles/Dockerfile.$component") or die "Failed to open output file";
  open(my $input, "./tools/dockerfile/$component.tmpl") or die "Failed to open input file";
  while(<$input>) {
    chomp;
    $_ =~ s/{VERSION}/$component_version/g;
    print $output $_, "\n";
  }
  close($input);
  close($output);
}

sub exec_command {
  my $command = shift;
  open(my $stdout, "$command 2>&1 |");
  my @result = <$stdout>;
  close($stdout);
  return @result;
}
