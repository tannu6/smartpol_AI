import os
import re

DIR = r"D:\smartpol_AI\frontend\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Add import if missing
    if "useTranslation" not in content and ("from 'react-i18next'" not in content or 'from "react-i18next"' not in content):
        # find the last import
        import_match = list(re.finditer(r"^import .*$", content, re.MULTILINE))
        if import_match:
            last_import = import_match[-1]
            content = content[:last_import.end()] + "\nimport { useTranslation } from 'react-i18next'" + content[last_import.end():]
        else:
            content = "import { useTranslation } from 'react-i18next'\n" + content

    # Add const { t } = useTranslation() inside the default export component
    if "const { t }" not in content:
        # find export default function ComponentName(props) {
        func_match = re.search(r"export default function \w+\s*\([^)]*\)\s*\{", content)
        if func_match:
            content = content[:func_match.end()] + "\n  const { t } = useTranslation()\n" + content[func_match.end():]
        else:
            # find const ComponentName = (props) => {
            arrow_match = re.search(r"const \w+\s*=\s*\([^)]*\)\s*=>\s*\{", content)
            if arrow_match:
                content = content[:arrow_match.end()] + "\n  const { t } = useTranslation()\n" + content[arrow_match.end():]

    replacements = {
        # Layout / General
        '>SmartPol AI<': '>{t(\'landing.hero.title\', \'SmartPol AI\')}<',
        '"SmartPol AI"': 't(\'landing.hero.title\', \'SmartPol AI\')',
        "'SmartPol AI'": 't(\'landing.hero.title\', \'SmartPol AI\')',
        '>AI Powered Smart Policing System<': '>{t(\'landing.hero.subtitle\', \'AI Powered Smart Policing System\')}<',
        '>Loading...<': '>{t(\'common.loading\', \'Loading...\')}<',
        '>Loading data...<': '>{t(\'tables.loading\', \'Loading data...\')}<',
        
        # Dashboard & Pages
        '>My Complaints<': '>{t(\'dashboard.myComplaints\', \'My Complaints\')}<',
        '"My Complaints"': 't(\'dashboard.myComplaints\', \'My Complaints\')',
        "'My Complaints'": "t('dashboard.myComplaints', 'My Complaints')",
        
        '>Priority Queue<': '>{t(\'dashboard.priorityQueue\', \'Priority Queue\')}<',
        '"Priority Queue"': 't(\'dashboard.priorityQueue\', \'Priority Queue\')',
        "'Priority Queue'": "t('dashboard.priorityQueue', 'Priority Queue')",
        
        '>Active Cases<': '>{t(\'dashboard.activeCases\', \'Active Cases\')}<',
        '"Active Cases"': 't(\'dashboard.activeCases\', \'Active Cases\')',
        
        '>Total Complaints<': '>{t(\'dashboard.totalComplaints\', \'Total Complaints\')}<',
        '"Total Complaints"': 't(\'dashboard.totalComplaints\', \'Total Complaints\')',
        
        '>Total Users<': '>{t(\'dashboard.totalUsers\', \'Total Users\')}<',
        '"Total Users"': 't(\'dashboard.totalUsers\', \'Total Users\')',
        
        '>System Logs<': '>{t(\'dashboard.systemLogs\', \'System Logs\')}<',
        '"System Logs"': 't(\'dashboard.systemLogs\', \'System Logs\')',
        
        '>Evidence Vault<': '>{t(\'nav.evidenceVault\', \'Evidence Vault\')}<',
        '"Evidence Vault"': 't(\'nav.evidenceVault\', \'Evidence Vault\')',
        
        '>File Another Complaint<': '>{t(\'complaint.fileAnother\', \'File Another Complaint\')}<',
        
        # Table Columns
        "label: 'ID'": "label: t('tables.id', 'ID')",
        "label: 'Title'": "label: t('tables.title', 'Title')",
        "label: 'Category'": "label: t('tables.category', 'Category')",
        "label: 'Status'": "label: t('tables.status', 'Status')",
        "label: 'Urgency'": "label: t('tables.urgency', 'Urgency')",
        "label: 'Action'": "label: t('tables.action', 'Action')",
        "label: 'Name'": "label: t('tables.name', 'Name')",
        "label: 'Date'": "label: t('tables.date', 'Date')",
        "label: 'Priority'": "label: t('tables.priority', 'Priority')",
        "label: 'Assigned To'": "label: t('tables.assignedTo', 'Assigned To')",
        "label: 'Created At'": "label: t('tables.createdAt', 'Created At')",
        "label: 'Updated At'": "label: t('tables.updatedAt', 'Updated At')",
        
        # Agent & Admin
        '>Manage Users<': '>{t(\'nav.manageUsers\', \'Manage Users\')}<',
        '"Manage Users"': 't(\'nav.manageUsers\', \'Manage Users\')',
        '>Manage Officers<': '>{t(\'nav.manageOfficers\', \'Manage Officers\')}<',
        '"Manage Officers"': 't(\'nav.manageOfficers\', \'Manage Officers\')',
        '>Manage Agents<': '>{t(\'nav.manageAgents\', \'Manage Agents\')}<',
        '"Manage Agents"': 't(\'nav.manageAgents\', \'Manage Agents\')',
        '>Roles & Permissions<': '>{t(\'nav.roles\', \'Roles & Permissions\')}<',
        '"Roles & Permissions"': 't(\'nav.roles\', \'Roles & Permissions\')',
        '>System Config<': '>{t(\'nav.systemConfig\', \'System Config\')}<',
        '"System Config"': 't(\'nav.systemConfig\', \'System Config\')',
        '>Admin Dashboard<': '>{t(\'nav.adminDashboard\', \'Admin Dashboard\')}<',
        '"Admin Dashboard"': 't(\'nav.adminDashboard\', \'Admin Dashboard\')',
        
        # Officer/Supervisor
        '>Command Center<': '>{t(\'nav.dashboard\', \'Command Center\')}<',
        '"Command Center"': 't(\'nav.dashboard\', \'Command Center\')',
        '>Investigation<': '>{t(\'nav.investigation\', \'Investigation\')}<',
        '"Investigation"': 't(\'nav.investigation\', \'Investigation\')',
        '>Mission Control<': '>{t(\'nav.mission\', \'Mission Control\')}<',
        '"Mission Control"': 't(\'nav.mission\', \'Mission Control\')',
        '>Analytics<': '>{t(\'nav.analytics\', \'Analytics\')}<',
        '"Analytics"': 't(\'nav.analytics\', \'Analytics\')',
        '>War Room<': '>{t(\'nav.warRoom\', \'War Room\')}<',
        '"War Room"': 't(\'nav.warRoom\', \'War Room\')',
        '>Heatmap<': '>{t(\'nav.heatmap\', \'Heatmap\')}<',
        '"Heatmap"': 't(\'nav.heatmap\', \'Heatmap\')',
        '>Crime Prediction<': '>{t(\'nav.prediction\', \'Crime Prediction\')}<',
        '"Crime Prediction"': 't(\'nav.prediction\', \'Crime Prediction\')',
        '>Patrol<': '>{t(\'nav.patrol\', \'Patrol\')}<',
        '"Patrol"': 't(\'nav.patrol\', \'Patrol\')',
        '>Intelligence Fusion<': '>{t(\'nav.fusion\', \'Intelligence Fusion\')}<',
        '"Intelligence Fusion"': 't(\'nav.fusion\', \'Intelligence Fusion\')',
        '>Scam DNA Lab<': '>{t(\'nav.scamDna\', \'Scam DNA Lab\')}<',
        '"Scam DNA Lab"': 't(\'nav.scamDna\', \'Scam DNA Lab\')',
        '>Mule Detection<': '>{t(\'nav.muleDetection\', \'Mule Detection\')}<',
        '"Mule Detection"': 't(\'nav.muleDetection\', \'Mule Detection\')',
        '>Suspect Graph<': '>{t(\'nav.suspects\', \'Suspect Graph\')}<',
        '"Suspect Graph"': 't(\'nav.suspects\', \'Suspect Graph\')',
        
        # Action links / buttons
        '>Timeline →<': '>{t(\'nav.timeline\', \'Timeline\')} →<',
        '>View Details<': '>{t(\'buttons.viewDetails\', \'View Details\')}<',
        '>Update<': '>{t(\'buttons.update\', \'Update\')}<',
    }

    for key, val in replacements.items():
        content = content.replace(key, val)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(DIR):
    if 'node_modules' in root:
        continue
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))

print("Translation script complete.")
