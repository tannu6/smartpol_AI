const fs = require('fs');
const path = require('path');

const base_dir = 'd:\\smartpol_AI\\frontend\\src\\i18n\\locales';
const locales = ['en', 'hi', 'gu'];

const new_keys = {
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
};

locales.forEach(loc => {
    const filePath = path.join(base_dir, `${loc}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    for (const [k, v] of Object.entries(new_keys[loc])) {
        if (!data[k]) data[k] = {};
        for (const [sub_k, sub_v] of Object.entries(v)) {
            data[k][sub_k] = sub_v;
        }
    }
    
    let auth = data.auth || {};
    
    const authUpdates = {
        'login': {
            'title': auth.login_title || 'Login',
            'subtitle': auth.login_subtitle || 'Enter credentials',
            'username': auth.operator_id || 'Username',
            'password': auth.access_key || 'Password',
            'submit': auth.authorize || 'Submit',
            'persistSession': auth.persistent_session || 'Persist',
            'forgotPassword': auth.emergency_reset || 'Forgot Password',
            'noAccount': auth.no_account || 'No account?',
            'registerLink': auth.register || 'Register'
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
    };
    
    if (loc === 'hi') {
        authUpdates.register = {
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
        };
    } else if (loc === 'gu') {
        authUpdates.register = {
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
        };
    }
        
    data.auth = { ...auth, ...authUpdates };
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
});

console.log("Translations patched.");
