rm filler.m2ts filler.m3u8
ffmpeg -loop 1 \
  -i filler.png \
  -c:v libx264 -an \
  -b:v 300k \
  -t 20 -r 30 -g 30 \
  -pix_fmt yuv420p \
  -f hls \
  -hls_time 0 \
  -hls_list_size 0 \
  -hls_flags single_file \
  -hls_ts_options mpegts_m2ts_mode=0 \
  -hls_segment_filename filler.m2ts \
  filler.m3u8 2>/dev/null
cat filler.m3u8 | perl -ne '$_ =~ /#EXT-X-BYTERANGE:(\d+)@(\d+)/ && $1 > 0 ? print $2, "," : undef'
