#!c:\Users\Tamara\shop21_phase3a\local\Scripts\python.exe
# EASY-INSTALL-ENTRY-SCRIPT: 'awsebcli==3.0.11','console_scripts','eb'
__requires__ = 'awsebcli==3.0.11'
import sys
from pkg_resources import load_entry_point

if __name__ == '__main__':
    sys.exit(
        load_entry_point('awsebcli==3.0.11', 'console_scripts', 'eb')()
    )
