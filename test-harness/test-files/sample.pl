#!/usr/bin/perl
# Sample Perl file for testing the Text Editor extension

use strict;
use warnings;
use File::Basename;
use File::Find;

my %file_tags;

sub add_tag {
    my ($file, $tag) = @_;
    $file_tags{$file} //= [];
    push @{$file_tags{$file}}, $tag
        unless grep { $_ eq $tag } @{$file_tags{$file}};
}

sub get_tags {
    my ($file) = @_;
    return @{$file_tags{$file} // []};
}

sub find_by_extension {
    my ($dir, $ext) = @_;
    my @results;
    find(sub {
        push @results, $File::Find::name
            if -f && /\.\Q$ext\E$/i;
    }, $dir);
    return @results;
}

sub format_size {
    my ($bytes) = @_;
    my @units = ('B', 'KB', 'MB', 'GB');
    for my $unit (@units) {
        return sprintf("%.1f %s", $bytes, $unit) if $bytes < 1024;
        $bytes /= 1024;
    }
    return sprintf("%.1f TB", $bytes);
}

# Usage
my @md_files = find_by_extension('.', 'md');
for my $file (@md_files) {
    add_tag($file, 'documentation');
    my $size = -s $file;
    printf "%s (%s) [%s]\n",
        basename($file),
        format_size($size),
        join(', ', get_tags($file));
}
