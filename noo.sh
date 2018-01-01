#!/bin/bash
tsc
sudo forever stopall
sudo forever start -l /home/pytely/noo/noo.log -a build/noo.js
tail -f -n50 ~/noo/noo.log
