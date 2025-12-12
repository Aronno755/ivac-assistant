(function() {
    'use strict';

    // Prevent multiple instances
    if (window.IVACAssistantLoaded) {
        console.log('IVAC Assistant already loaded');
        return;
    }
    window.IVACAssistantLoaded = true;

    // Hardcoded personal info - MODIFY THESE VALUES AS NEEDED
    let PERSONAL_INFO = {
        full_name: 'FARHANA ALAM AKHI',
        email_name: 'akhifarhana74@gmail.com',
        phone: '01711114843',
        webfile_id: 'BGDCV10C9E25',
        family: {
            1: {
                name: 'MD MEZBAH UDDIN SHAH',
                webfile_no: 'BGDCV10CA125',
                again_webfile_no: 'BGDCV10CA125'
            },
            2: {
                name: 'MOBASHWIR BIN SHAH ARAF',
                webfile_no: 'BGDCV10CA625',
                again_webfile_no: 'BGDCV10CA625'
            },
            3: {
                name: 'MD MOHIDUL ALAM ABIR',
                webfile_no: 'BGDCV10CAA25',
                again_webfile_no: 'BGDCV10CAA25'
            },
            4: {
                name: 'SUNITA RANI DAS',
                webfile_no: 'BGDCV0ECD225',
                again_webfile_no: 'BGDCV0ECD225'
            }
        }
    };

    // Hardcoded Cloudflare sitekeys
    const CLOUDFLARE_SITEKEYS = {
        login: '0x4AAAAAABpNUpzYeppBoYpe',
        booking: '0x4AAAAAABvQ3Mi6RktCuZ7P',
        payment: '0x4AAAAAABvQ3Mi6RktCuZ7P'
    };

    // Automation control
    let automationControl = {
        login: {
            running: false,
            stop: false
        },
        booking: {
            running: false,
            stop: false
        }
    };

    // ==========================================
    // LOGIN FLOW: Unified URL, Dynamic Action Handling
    // ==========================================
    async function startAutoLogin() {
        const mobileNumber = document.getElementById('mobile-number').value.trim();
        const password = document.getElementById('password').value.trim();
        const captchaToken = document.getElementById('captcha-token').value.trim();

        if (!mobileNumber || !password || !captchaToken) {
            updateStatus('⚠️ Please fill in all fields before starting auto login', 'warning');
            return;
        }

        automationControl.login.running = true;
        automationControl.login.stop = false;

        const startBtn = document.getElementById('start-auto-login');
        const stopBtn = document.getElementById('stop-auto-login');
        
        // Toggle button visibility
        startBtn.style.display = 'none';
        stopBtn.style.display = 'block';

        try {
            // Step 1: Mobile verification
            updateStatus('🔄 Step 1/3: Verifying mobile number...', 'info');
            const mobileResult = await customFetch('https://payment.ivacbd.com/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    mobile_no: mobileNumber,
                    captcha_token: captchaToken,
                    answer: 62,  // Assuming this is the CAPTCHA answer or any required answer
                    user_input: '62' // Another parameter that seems to be part of the payload
                })
            });

            if (mobileResult.status_code === 200) {
                const nextAction = mobileResult.data.next_action;
                updateStatus('✅ Step 1/3: Mobile verified! Proceeding to password submission.', 'success');

                // Step 2: Submit password
                updateStatus('🔄 Step 2/3: Submitting password...', 'info');
                const passwordResult = await customFetch('https://payment.ivacbd.com/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        mobile_no: mobileNumber,
                        password: password,
                        next_action: nextAction
                    })
                });

                if (passwordResult.status_code === 200) {
                    const nextAction = passwordResult.data.next_action;
                    updateStatus('✅ Step 2/3: Password submitted! Proceeding to OTP verification.', 'success');

                    // Step 3: Submit OTP
                    updateStatus('🔄 Step 3/3: Submitting OTP...', 'info');
                    const otp = document.getElementById('otp').value.trim();
                    const otpResult = await customFetch('https://payment.ivacbd.com/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            mobile_no: mobileNumber,
                            password: password,
                            otp: otp,
                            next_action: nextAction
                        })
                    });

                    if (otpResult.status_code === 200) {
                        updateStatus('🎉 Login completed successfully! Redirecting...', 'success');
                        window.location.href = '/application'; // Redirect to the application page
                    } else {
                        throw new Error('OTP submission failed');
                    }
                } else {
                    throw new Error('Password submission failed');
                }
            } else {
                throw new Error('Mobile verification failed');
            }
        } catch (error) {
            updateStatus(`❌ Auto login failed: ${error.message}`, 'error');
        } finally {
            automationControl.login.running = false;
            startBtn.style.display = 'block';
            stopBtn.style.display = 'none';
        }
    }

    // ==========================================
    // HELPER FUNCTIONS
    // ==========================================
    function updateStatus(message, type = 'info') {
        const statusDiv = document.getElementById('status');
        const colors = {
            info: 'linear-gradient(135deg, #e0f7fa 0%, #e1f5fe 100%)',
            success: 'linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%)',
            error: 'linear-gradient(135deg, #ffcdd2 0%, #ef9a9a 100%)',
            warning: 'linear-gradient(135deg, #fff9c4 0%, #fff59d 100%)'
        };
        const borderColors = {
            info: '#4dd0e1',
            success: '#66bb6a',
            error: '#e57373',
            warning: '#ffd54f'
        };
        const textColors = {
            info: '#00695c',
            success: '#2e7d32',
            error: '#c62828',
            warning: '#f57f17'
        };
        statusDiv.style.background = colors[type] || colors.info;
        statusDiv.style.borderColor = borderColors[type] || borderColors.info;
        statusDiv.style.color = textColors[type] || textColors.info;
        statusDiv.innerHTML = message;
        console.log(`[IVAC - Login] ${message}`);
    }

    // Custom Fetch function to handle the POST requests
    async function customFetch(url, options) {
        const csrfToken = getCsrfToken();
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': csrfToken
        };

        const fetchOptions = {
            method: options.method || 'POST',
            headers: {
                ...defaultHeaders,
                ...options.headers
            },
            credentials: 'include'
        };

        if (options.body) {
            fetchOptions.body = JSON.stringify(options.body);
        }

        const response = await fetch(url, fetchOptions);
        const data = await response.json();

        return {
            ...data,
            status: response.status,
            ok: response.ok
        };
    }

    function getCsrfToken() {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag) {
            return metaTag.getAttribute('content');
        }

        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'XSRF-TOKEN') {
                return decodeURIComponent(value);
            }
        }
        return '';
    }

    // ==========================================
    // INIT FUNCTIONS
    // ==========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScript);
    } else {
        initScript();
    }

    function initScript() {
        console.log('Lotus Appt 1.0 initializing...');
        setTimeout(createMainPanel, 1000);
    }

    function createMainPanel() {
        // Main Panel HTML and CSS setup
        const container = document.createElement('div');
        container.id = 'ivac-assistant-main';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 500px;
            min-width: 450px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: 3px solid #5a67d8;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
            max-height: 90vh;
            overflow: hidden;
        `;

        container.innerHTML = `
            <div id="panel-header">
                <h3>Lotus Appt 1.0</h3>
            </div>
            <div id="tab-navigation">
                <button class="tab-button active" data-tab="login">🔐 IVAC Login</button>
                <button class="tab-button" data-tab="booking">📅 App Booking</button>
                <button class="tab-button" data-tab="payment">💳 Payment</button>
            </div>
            <div id="panel-content">
                <div id="login-tab" class="tab-content active">
                    ${createLoginTabContent()}
                </div>
            </div>
        `;

        document.body.appendChild(container);

        // Initialize features
        setupTabSwitching();
        setupEventListeners();

        console.log('IVAC Assistant loaded successfully');
    }

    function setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                tabButtons.forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                button.classList.add('active');
                document.getElementById(`${targetTab}-tab`).classList.add('active');
            });
        });
    }

    function setupEventListeners() {
        // Setup button and form event listeners
        document.getElementById('start-auto-login').addEventListener('click', startAutoLogin);
    }
})();
