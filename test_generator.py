#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Tests for the business tools generator
"""

import os
import sys
import unittest

# Add the parent directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import generate_business_tools


class TestBusinessToolsGenerator(unittest.TestCase):
    """Test cases for the business tools generator"""
    
    def test_html_file_generated(self):
        """Test that HTML file is generated"""
        self.assertTrue(os.path.exists(generate_business_tools.html_path))
        
    def test_html_file_not_empty(self):
        """Test that HTML file is not empty"""
        size = os.path.getsize(generate_business_tools.html_path)
        self.assertGreater(size, 0)
        
    def test_html_file_content(self):
        """Test that HTML file contains expected content"""
        with open(generate_business_tools.html_path, 'r', encoding='utf-8') as f:
            content = f.read()
        self.assertIn('<!doctype html>', content)
        self.assertIn('Abonnement Pro', content)
        self.assertIn('PRO', content)
        self.assertIn('PREMIUM', content)
        
    def test_scripts_file_generated(self):
        """Test that scripts file is generated"""
        self.assertTrue(os.path.exists(generate_business_tools.script_path))
        
    def test_scripts_file_not_empty(self):
        """Test that scripts file is not empty"""
        size = os.path.getsize(generate_business_tools.script_path)
        self.assertGreater(size, 0)
        
    def test_scripts_file_content(self):
        """Test that scripts file contains expected content"""
        with open(generate_business_tools.script_path, 'r', encoding='utf-8') as f:
            content = f.read()
        self.assertIn('SCRIPTS CALL CENTER', content)
        self.assertIn('OUVERTURE D\'APPEL', content)
        self.assertIn('CRM', content)
        
    def test_devis_file_generated(self):
        """Test that DOCX file is generated"""
        self.assertTrue(os.path.exists(generate_business_tools.devis_path))
        
    def test_devis_file_not_empty(self):
        """Test that DOCX file is not empty"""
        size = os.path.getsize(generate_business_tools.devis_path)
        self.assertGreater(size, 0)
        
    def test_crm_file_generated(self):
        """Test that CSV file is generated"""
        self.assertTrue(os.path.exists(generate_business_tools.crm_path))
        
    def test_crm_file_not_empty(self):
        """Test that CSV file is not empty"""
        size = os.path.getsize(generate_business_tools.crm_path)
        self.assertGreater(size, 0)
        
    def test_crm_file_content(self):
        """Test that CSV file contains expected headers"""
        with open(generate_business_tools.crm_path, 'r', encoding='utf-8') as f:
            content = f.read()
        self.assertIn('LeadID', content)
        self.assertIn('Nom', content)
        self.assertIn('Email', content)
        self.assertIn('L-0001', content)


if __name__ == '__main__':
    unittest.main()
