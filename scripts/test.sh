#!/bin/bash

TESTPVTA='0x0bce878dba9cce506e81da71bb00558d1684979711cf2833bab06388f715c01a'
TESTPVTB='0xff7da9b82a2bd5d76352b9c385295a430d2ea8f9f6f405a7ced42a5b0e73aad7'
TESTACCTA='0x8c34f41f1cf2dfe2c28b1ce7808031c40ce26d38'
TESTACCTB='0x147b61187f3f16583ac77060cbc4f711ae6c9349'

SCA='0xF68580C3263FB98C6EAeE7164afD45Ecf6189EbB'
TOK='0x4ebf4321a360533ac2d48a713b8f18d341210078'

echo CONFIRM running:
echo ""
echo ganache-cli --account="<privatekey>,balance"
echo "         " --account="<privatekey>,balance"
echo ""
read -p '[N/y]: ' ans
if [[ $ans != "y" && $ans != "Y" ]]; then
  echo ""
  echo Please run the following before this:
  echo ""
  echo -n ganache-cli ""
  echo -n --account=\"$TESTPVTA,100000000000000000000\" ""
  echo  --account=\"$TESTPVTB,100000000000000000000\"
  echo ""
  exit
fi

echo "deploy"
node cli.js 0 0 deploy
node cli.js 0 0 stub
echo ""

echo "report our state"
node cli.js 0 $SCA variables
echo ""

echo "should throw..."
node cli.js 0 $SCA add $TESTACCTA
echo ""

echo "add B"
node cli.js 0 $SCA add $TESTACCTB
echo ""

echo "flag B"
node cli.js 0 $SCA flag $TESTACCTB TRUE
echo ""

echo "unflag B"
node cli.js 0 $SCA flag $TESTACCTB FALSE
echo ""

echo "replace B with A and back again"
node cli.js 0 $SCA replace $TESTACCTB $TESTACCTA
node cli.js 0 $SCA replace $TESTACCTA $TESTACCTB
echo ""

echo "A makes a spending proposal"
node cli.js 0 $SCA proposal $TESTACCTB 1000000000000000000 'invoice #1234'
echo ""

echo "B approves spend, spend happens"
node cli.js 1 $SCA approve $TESTACCTB 1000000000000000000 'invoice #1234'
echo ""

echo "treasurer issues a transfer proposal"
node cli.js 0 $SCA proposeTransfer $TOK $TESTACCTB 1 'xfer #001'
echo ""

echo "B approves transfer"
node cli.js 1 $SCA approveTransfer $TOK $TESTACCTB 1 'xfer #001'
echo ""

