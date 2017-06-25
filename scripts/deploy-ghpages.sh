#!/bin/sh
# ideas used from https://gist.github.com/motemen/8595451

# Based on https://github.com/eldarlabs/ghpages-deploy-script/blob/master/scripts/deploy-ghpages.sh
# Used with their MIT license https://github.com/eldarlabs/ghpages-deploy-script/blob/master/LICENSE

# abort the script if there is a non-zero error
set -e

cd harvest-invoice-creator

git checkout gh-pages
git rm -rf .
git pull origin master

# stage any changes and new files
git add -A
# now commit, ignoring branch gh-pages doesn't seem to work, so trying skip
git commit --allow-empty -m "Deploy to GitHub pages [ci skip]"
# and push, but send any output to /dev/null to hide anything sensitive
git push --force --quiet origin gh-pages

echo "Finished Deployment!"
