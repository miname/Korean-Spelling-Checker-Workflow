#!/bin/bash
INPUT_TEXT=$(tee)
BASE_URL=http://speller.cs.pusan.ac.kr
CHECK_URL=$BASE_URL/results
KSC_PATH="$(pwd)/Library/Services/✔\ 선택한\ 글의\ 한국어\ 맞춤법\ 검사하기.workflow/Contents"
SCRIPT_PATH=$KSC_PATH/script.js
STYLE_PATH=$KSC_PATH/style.css
UPDATE=2019-03-17
UPDATE_STATUS=$(curl -s -o /dev/null -I -w "%{http_code}" -m 3 https://appletree.or.kr/automator/$UPDATE.txt)
curl --data-urlencode "text1=$INPUT_TEXT" $CHECK_URL -o .korean-spelling-checker-result.html && sed -i -e "s|\.\./|$BASE_URL/|g" .korean-spelling-checker-result.html && sed -E -i -e "s (css|js)/ $BASE_URL/\1/ g" .korean-spelling-checker-result.html && sed -i -e "s|<body|<link rel='stylesheet' href='$STYLE_PATH'><script defer src='$SCRIPT_PATH' id='ksc' data-update-status='$UPDATE_STATUS'></script><base href='$BASE_URL'></head><body|" .korean-spelling-checker-result.html && echo "$(<~/.korean-spelling-checker-result.html)"