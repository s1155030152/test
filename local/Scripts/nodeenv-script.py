#!c:\Users\Tamara\shop21_phase3a\local\Scripts\python.exe
# EASY-INSTALL-ENTRY-SCRIPT: 'nodeenv==0.12.3','console_scripts','nodeenv'
__requires__ = 'nodeenv==0.12.3'
import sys
from pkg_resources import load_entry_point

if __name__ == '__main__':
    sys.exit(
        load_entry_point('nodeenv==0.12.3', 'console_scripts', 'nodeenv')()
    )