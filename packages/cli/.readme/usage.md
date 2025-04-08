```
$ # Sign the file in place
$ signedsource sign unsigned.txt

$ # Output to a different file
$ signedsource sign unsigned.txt --outFile signed.txt

$ # Output to stdout
$ signedsource sign unsigned.txt --outFile -

$ # Verify a signed file
$ signedsource verify signed.txt
```
