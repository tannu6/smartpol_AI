import json
import os

base_dir = r"d:\smartpol_AI\frontend\src\i18n\locales"
locales = ['en', 'hi', 'gu']

new_keys = {
    'en': {
        'roles': {
            'citizen': 'Citizen',
            'officer': 'Officer',
            'supervisor': 'Supervisor'
        },
        'landing': {
            'hero': {
                'title': 'SmartPol AI'
            }
        }
    },
    'hi': {
        'roles': {
            'citizen': 'नागरिक',
            'officer': 'अधिकारी',
            'supervisor': 'पर्यवेक्षक'
        },
        'landing': {
            'hero': {
                'title': 'स्मार्टपोल AI'
            }
        }
    },
    'gu': {
        'roles': {
            'citizen': 'નાગરિક',
            'officer': 'અધિકારી',
            'supervisor': 'સુપરવાઇઝર'
        },
        'landing': {
            'hero': {
                'title': 'સ્માર્ટપોલ AI'
            }
        }
    }
}

for loc in locales:
    file_path = os.path.join(base_dir, f"{loc}.json")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Merge new keys
    for k, v in new_keys[loc].items():
        if k not in data:
            data[k] = {}
        for sub_k, sub_v in v.items():
            data[k][sub_k] = sub_v
            
    # Also remap the auth.login.title to auth.login_title in the files so the code works, or vice versa.
    # Actually, the React code is looking for auth.login.title, auth.login.username, etc.
    # The JSON currently has auth.login_title. Let's fix the JSON to have auth.login objects!
    
    auth = data.get('auth', {})
    
    # Remap en/hi/gu auth fields
    auth_updates = {
        'login': {
            'title': auth.get('login_title', 'Login'),
            'subtitle': auth.get('login_subtitle', 'Enter credentials'),
            'username': auth.get('operator_id', 'Username'),
            'password': auth.get('access_key', 'Password'),
            'submit': auth.get('authorize', 'Submit'),
            'persistSession': auth.get('persistent_session', 'Persist'),
            'forgotPassword': auth.get('emergency_reset', 'Forgot Password'),
            'noAccount': auth.get('no_account', 'No account?'),
            'registerLink': auth.get('register', 'Register')
        },
        'register': {
            'title': 'Register',
            'description': 'Create your account',
            'username': 'Username',
            'email': 'Email',
            'firstName': 'First Name',
            'lastName': 'Last Name',
            'role': 'Role',
            'password': 'Password',
            'confirmPassword': 'Confirm Password',
            'submit': 'Register',
            'alreadyRegistered': 'Already registered?',
            'loginLink': 'Login',
            'tagline': 'Enrollment System'
        }
    }
    
    # Simple manual translations for the register fields if Hindi/Gujarati
    if loc == 'hi':
        auth_updates['register'] = {
            'title': 'पंजीकरण',
            'description': 'अपना खाता बनाएं',
            'username': 'उपयोगकर्ता नाम',
            'email': 'ईमेल',
            'firstName': 'प्रथम नाम',
            'lastName': 'अंतिम नाम',
            'role': 'भूमिका',
            'password': 'पासवर्ड',
            'confirmPassword': 'पासवर्ड की पुष्टि करें',
            'submit': 'पंजीकरण करें',
            'alreadyRegistered': 'पहले से पंजीकृत हैं?',
            'loginLink': 'लॉगिन करें',
            'tagline': 'नामांकन प्रणाली'
        }
    elif loc == 'gu':
        auth_updates['register'] = {
            'title': 'નોંધણી',
            'description': 'તમારું એકાઉન્ટ બનાવો',
            'username': 'વપરાશકર્તા નામ',
            'email': 'ઇમેઇલ',
            'firstName': 'પ્રથમ નામ',
            'lastName': 'છેલ્લું નામ',
            'role': 'ભૂમિકા',
            'password': 'પાસવર્ડ',
            'confirmPassword': 'પાસવર્ડની પુષ્ટિ કરો',
            'submit': 'નોંધણી કરો',
            'alreadyRegistered': 'પહેલેથી નોંધણી થયેલ છે?',
            'loginLink': 'લોગિન કરો',
            'tagline': 'નોંધણી સિસ્ટમ'
        }
        
    auth.update(auth_updates)
    data['auth'] = auth
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

print("Translations patched.")
