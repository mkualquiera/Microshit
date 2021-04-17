import json
import os
import pathlib
import sys
import shutil

TEAMS_PATH = '/usr/share/teams/'
ASAR_PATH = os.path.join(TEAMS_PATH,"resources","app.asar")
MICROSHIT_PATH = pathlib.Path(__file__).parent.absolute()
UNPACK_LOCATION = os.path.join(MICROSHIT_PATH,"unpack")
MOD_PATH = os.path.join(MICROSHIT_PATH,"mod")
INJECTION_PATH = os.path.join(MOD_PATH,"injection.js")


euid = os.geteuid()
if euid != 0:
    print("This script must be run as root.")
    exit()

print("Unpacking MS Teams asar file...")
os.system(f'npx asar extract {ASAR_PATH} {UNPACK_LOCATION}')

print("Reading package.json...")
with open(os.path.join(UNPACK_LOCATION,"package.json"),"r") as f:
    package = json.load(f)

if "main" not in package:
    print("FATAL ERROR")
    print("package.json seems to not have a reference to main.")
    print("Perhaps Teams was updated and now they do some weird crap?")
    print("Or maybe we just couldn't read the file properly.")
    exit()

print("Patching package.json...")
package['main'] = 'lib/microshit_bootstrap.js'

with open(os.path.join(UNPACK_LOCATION,"package.json"),"w") as f:
    json.dump(package,f)

print("Writing bootstrap file...")
with open(os.path.join(UNPACK_LOCATION,"lib",
    "microshit_bootstrap.js"),"w") as f:
    f.write(f'''
process.env.modPath = '{MOD_PATH}';
require('{INJECTION_PATH}');
module.exports = require('./main.js');
    ''')

print("Backing up asar file...")
os.rename(ASAR_PATH, ASAR_PATH + ".OLD")

print("Repacking asar file...")
os.system(f'npx asar pack {UNPACK_LOCATION} ./app.asar')

print("Moving asar file...")
shutil.move("./app.asar", ASAR_PATH)

print("Cleaning up unpack...")
shutil.rmtree(UNPACK_LOCATION)

print("Done!")