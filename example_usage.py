#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Example script demonstrating how to use the business tools generator
"""

import os
import sys

# Add the parent directory to the path to import the generator
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import generate_business_tools

def main():
    """
    Run the business tools generator and display results
    """
    print("=" * 60)
    print("BCF Business Tools Generator - Example")
    print("=" * 60)
    print()
    
    # The files are generated when the module is imported
    files = [
        generate_business_tools.html_path,
        generate_business_tools.script_path,
        generate_business_tools.devis_path,
        generate_business_tools.crm_path
    ]
    
    print("Generated files:")
    print()
    for filepath in files:
        filename = os.path.basename(filepath)
        if os.path.exists(filepath):
            size = os.path.getsize(filepath)
            print(f"  ✓ {filename}")
            print(f"    Path: {filepath}")
            print(f"    Size: {size:,} bytes")
        else:
            print(f"  ✗ {filename} (NOT FOUND)")
        print()
    
    print("=" * 60)
    print("Files generated successfully!")
    print("=" * 60)

if __name__ == "__main__":
    main()
