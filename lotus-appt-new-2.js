/**
 * Lotus Appt 1.0 - Enhanced Automation Edition with OCR
 * Advanced automation with smart retry logic and streamlined UI
 * Compatible with bookmarklet loader method
 * 
 * Usage: Load this script via bookmarklet on payment.ivacbd.com
 */

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

    // Application info
    let APPLICATION_INFO = {
        highcom: '2',
        webfile_id: 'BGDCV10C9E25',
        webfile_id_repeat: 'BGDCV10C9E25',
        ivac_id: '5',
        visa_type: '13',
        family_count: '3',
        visit_purpose: 'CARDIOVASCULAR TREATMENT'
    };

    // Hardcoded Cloudflare sitekeys
    const CLOUDFLARE_SITEKEYS = {
        login: '0x4AAAAAABpNUpzYeppBoYpe',
        booking: '0x4AAAAAABvQ3Mi6RktCuZ7P',
        payment: '0x4AAAAAABvQ3Mi6RktCuZ7P'
    };

    // API Endpoints
    const API_ENDPOINTS = {
        booking: {
            applicationInfo: '/api/v2/payment/application-r5s7h3-submit-hyju6t',
            personalInfo: '/api/v2/payment/personal-info-submit',
            overview: '/api/v2/payment/overview-submit',
            captchaFieldName: 'y6e7uk_token_t6d8n3'
        },
        payment: {
            endpoint: '/api/v2/payment/h7j3wt-now-y0k3d6',
            captchaFieldName: 'k5t0g8_token_y4v9f6',
            verifyCaptcha: '/api/v2/captcha/verify-pay'
        }
    };

    // Payment data storage
    let paymentData = {
        slotDates: {},
        slotTimes: [],
        paymentUrl: '',
        selectedPaymentMethod: 'visacard',
        captchaId: '',
        captchaImage: '',
        captchaVerified: false
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

    // OCR control
    let ocrControl = {
        loaded: false,
        processing: false
    };

    // ==========================================
    // INITIALIZATION
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
        // Remove existing panel if any
        const existing = document.getElementById('ivac-assistant-main');
        if (existing) {
            existing.remove();
        }

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
            <div id="panel-header" style="
                background: rgba(0, 0, 0, 0.3);
                color: white;
                padding: 15px 20px;
                border-radius: 9px 9px 0 0;
                cursor: move;
                user-select: none;
                position: relative;
                display: flex;
                justify-content: space-between;
                align-items: center;
                backdrop-filter: blur(10px);
            ">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 24px;">🚀</span>
                    <h3 style="margin: 0; font-size: 18px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">Lotus Appt 1.0</h3>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button id="minimize-panel" style="
                        background: rgba(255,255,255,0.2);
                        border: 2px solid rgba(255,255,255,0.3);
                        color: white;
                        width: 28px;
                        height: 28px;
                        border-radius: 6px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 18px;
                        font-weight: bold;
                        transition: all 0.3s;
                    " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">−</button>
                    <button id="close-panel" style="
                        background: rgba(255, 77, 77, 0.8);
                        border: 2px solid rgba(255,255,255,0.3);
                        color: white;
                        width: 28px;
                        height: 28px;
                        border-radius: 6px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 20px;
                        font-weight: bold;
                        transition: all 0.3s;
                    " onmouseover="this.style.background='rgba(255, 77, 77, 1)'" onmouseout="this.style.background='rgba(255, 77, 77, 0.8)'">×</button>
                </div>
            </div>

            <div id="tab-navigation" style="
                background: rgba(0, 0, 0, 0.2);
                border-bottom: 2px solid rgba(255,255,255,0.1);
                display: flex;
                backdrop-filter: blur(10px);
            ">
                <button class="tab-button active" data-tab="login" style="
                    flex: 1;
                    padding: 14px 16px;
                    border: none;
                    background: rgba(255, 255, 255, 0.95);
                    color: #667eea;
                    cursor: pointer;
                    border-right: 1px solid rgba(255,255,255,0.1);
                    font-size: 13px;
                    font-weight: bold;
                    transition: all 0.3s;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                ">🔐 IVAC Login</button>
                <button class="tab-button" data-tab="booking" style="
                    flex: 1;
                    padding: 14px 16px;
                    border: none;
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    cursor: pointer;
                    border-right: 1px solid rgba(255,255,255,0.1);
                    font-size: 13px;
                    font-weight: bold;
                    transition: all 0.3s;
                ">📅 App Booking</button>
                <button class="tab-button" data-tab="payment" style="
                    flex: 1;
                    padding: 14px 16px;
                    border: none;
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: bold;
                    transition: all 0.3s;
                ">💳 Payment</button>
            </div>

            <div id="panel-content" style="
                padding: 20px;
                background: white;
                border-radius: 0 0 9px 9px;
                max-height: calc(90vh - 140px);
                overflow-y: auto;
            ">
                <div id="login-tab" class="tab-content active">
                    ${createLoginTabContent()}
                </div>

                <div id="booking-tab" class="tab-content" style="display: none;">
                    ${createBookingTabContent()}
                </div>

                <div id="payment-tab" class="tab-content" style="display: none;">
                    ${createPaymentTabContent()}
                </div>
            </div>

            <div id="resize-handle" style="
                position: absolute;
                bottom: 0;
                right: 0;
                width: 20px;
                height: 20px;
                background: linear-gradient(-45deg, transparent 0%, transparent 40%, rgba(255,255,255,0.3) 40%, rgba(255,255,255,0.3) 60%, transparent 60%);
                cursor: nw-resize;
                border-radius: 0 0 9px 0;
            "></div>
        `;

        document.body.appendChild(container);

        console.log('Panel created successfully');

        // Initialize features
        makeDraggable(container);
        makeResizable(container);
        setupTabSwitching();
        setupEventListeners();
        loadPersistedData();

        console.log('IVAC Assistant loaded successfully');
    }

    function createLoginTabContent() {
        return `
            <!-- Token Display Row (3 columns) -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <button id="toggle-access-token" class="toggle-btn" style="
                    padding: 10px 12px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 12px;
                    transition: all 0.3s;
                    box-shadow: 0 2px 6px rgba(102, 126, 234, 0.4);
                ">🔑 Access Token</button>
                <button id="toggle-captcha-token" class="toggle-btn" style="
                    padding: 10px 12px;
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 12px;
                    transition: all 0.3s;
                    box-shadow: 0 2px 6px rgba(245, 87, 108, 0.4);
                ">🔐 Captcha Token</button>
                <button id="load-captcha" style="
                    padding: 10px 12px;
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 12px;
                    transition: all 0.3s;
                    box-shadow: 0 2px 6px rgba(79, 172, 254, 0.4);
                ">🔄 Load CAPTCHA</button>
            </div>

            <!-- Collapsible Token Fields -->
            <div id="access-token-container" style="display: none; margin-bottom: 15px;">
                <input type="text" id="access-token-display" readonly style="
                    width: 100%;
                    padding: 8px;
                    border: 2px solid #667eea;
                    border-radius: 6px;
                    background: #f0f4ff;
                    font-size: 11px;
                    box-sizing: border-box;
                " placeholder="Token will appear after successful login">
            </div>

            <div id="captcha-token-container" style="display: none; margin-bottom: 15px;">
                <input type="text" id="captcha-token" readonly style="
                    width: 100%;
                    padding: 8px;
                    border: 2px solid #f5576c;
                    border-radius: 6px;
                    background: #fff0f3;
                    font-size: 11px;
                    box-sizing: border-box;
                " placeholder="Token will appear after verification">
            </div>

            <!-- Captcha Container -->
            <div id="captcha-container" style="
                margin-bottom: 15px;
                min-height: 80px;
                border: 2px dashed #ddd;
                border-radius: 8px;
                padding: 10px;
                text-align: center;
                color: #666;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #fafafa;
            ">
                Click "Load CAPTCHA" to verify
            </div>

            <!-- Mobile Number -->
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333; font-size: 13px;">📱 Mobile Number</label>
                <input type="tel" id="mobile-number" placeholder="Enter mobile number (e.g., 01711114843)" style="
                    width: 100%;
                    padding: 10px;
                    border: 2px solid #ddd;
                    border-radius: 6px;
                    box-sizing: border-box;
                    font-size: 14px;
                    transition: border 0.3s;
                " maxlength="11">
            </div>

            <!-- Password -->
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333; font-size: 13px;">🔒 Password</label>
                <input type="password" id="password" placeholder="Enter password" style="
                    width: 100%;
                    padding: 10px;
                    border: 2px solid #ddd;
                    border-radius: 6px;
                    box-sizing: border-box;
                    font-size: 14px;
                    transition: border 0.3s;
                ">
            </div>

            <!-- OTP -->
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333; font-size: 13px;">🔢 OTP</label>
                <input type="text" id="otp" placeholder="Enter OTP" style="
                    width: 100%;
                    padding: 10px;
                    border: 2px solid #ddd;
                    border-radius: 6px;
                    box-sizing: border-box;
                    font-size: 14px;
                    transition: border 0.3s;
                " maxlength="6">
            </div>

            <!-- Auto Login Buttons Container -->
            <div id="login-button-container" style="margin-bottom: 15px;">
                <button id="start-auto-login" style="
                    width: 100%;
                    padding: 14px 20px;
                    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 15px;
                    transition: all 0.3s;
                    box-shadow: 0 4px 15px rgba(17, 153, 142, 0.4);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                ">🤖 Start Auto Login</button>
                <button id="stop-auto-login" style="
                    width: 100%;
                    padding: 14px 20px;
                    background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 15px;
                    transition: all 0.3s;
                    box-shadow: 0 4px 15px rgba(235, 51, 73, 0.4);
                    text-transform: uppercase;
                    display: none;
                ">⛔ Stop Auto Login</button>
            </div>

            <!-- Manual Controls Row -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <button id="verify-mobile" style="
                    padding: 10px 12px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: bold;
                    transition: all 0.3s;
                ">Verify Mobile</button>
                <button id="submit-password" style="
                    padding: 10px 12px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: bold;
                    transition: all 0.3s;
                ">Submit Password</button>
                <button id="submit-otp" style="
                    padding: 10px 12px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: bold;
                    transition: all 0.3s;
                ">Submit OTP</button>
            </div>

            <!-- Status Display -->
            <div id="status" style="
                margin-top: 15px;
                padding: 12px;
                border-radius: 8px;
                background: linear-gradient(135deg, #e0f7fa 0%, #e1f5fe 100%);
                border: 2px solid #4dd0e1;
                font-size: 13px;
                line-height: 1.6;
                color: #00695c;
            ">
                ✅ Ready to start login process...
            </div>
        `;
    }

    function createBookingTabContent() {
        return `
            <!-- Control Buttons Row -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <button id="upload-data-btn" style="
                    padding: 12px 16px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 13px;
                    transition: all 0.3s;
                    box-shadow: 0 2px 6px rgba(102, 126, 234, 0.4);
                ">📤 Upload Data</button>
                <button id="start-auto-booking" style="
                    padding: 12px 16px;
                    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 13px;
                    transition: all 0.3s;
                    box-shadow: 0 2px 6px rgba(17, 153, 142, 0.4);
                ">🤖 Start Auto Booking</button>
                <button id="stop-booking" style="
                    padding: 12px 16px;
                    background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 13px;
                    transition: all 0.3s;
                    box-shadow: 0 2px 6px rgba(235, 51, 73, 0.4);
                ">⛔ Stop</button>
            </div>

            <!-- Hidden File Input -->
            <input type="file" id="data-file-input" accept=".txt" style="display: none;">

            <!-- Access Token Toggle Button -->
            <div style="margin-bottom: 15px;">
                <button id="toggle-booking-access-token" class="toggle-btn" style="
                    width: 100%;
                    padding: 10px 12px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 12px;
                    transition: all 0.3s;
                    box-shadow: 0 2px 6px rgba(102, 126, 234, 0.4);
                ">🔑 Access Token</button>
            </div>

            <!-- Collapsible Access Token Field -->
            <div id="booking-access-token-container" style="display: none; margin-bottom: 15px;">
                <input type="text" id="booking-access-token" readonly style="
                    width: 100%;
                    padding: 8px;
                    border: 2px solid #667eea;
                    border-radius: 6px;
                    background: #f0f4ff;
                    font-size: 11px;
                    box-sizing: border-box;
                " placeholder="Access token from login">
            </div>

            <!-- Hidden Captcha Container -->
            <div id="booking-captcha-container" style="display: none;"></div>

            <!-- Manual Controls Row -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <button id="submit-application-info" style="
                    padding: 10px 12px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: bold;
                    transition: all 0.3s;
                ">Application Info</button>
                <button id="submit-personal-info" style="
                    padding: 10px 12px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: bold;
                    transition: all 0.3s;
                ">Personal Info</button>
                <button id="submit-overview" style="
                    padding: 10px 12px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: bold;
                    transition: all 0.3s;
                ">Overview</button>
            </div>

            <!-- Status Display -->
            <div id="booking-status" style="
                margin-top: 15px;
                padding: 12px;
                border-radius: 8px;
                background: linear-gradient(135deg, #e0f7fa 0%, #e1f5fe 100%);
                border: 2px solid #4dd0e1;
                font-size: 13px;
                line-height: 1.6;
                color: #00695c;
            ">
                ✅ Ready to start booking process...
            </div>
        `;
    }

    function createPaymentTabContent() {
        return `
            <!-- Toggle Buttons Row -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <button id="toggle-payment-access-token" class="toggle-btn" style="
                    padding: 10px 12px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 12px;
                    transition: all 0.3s;
                    box-shadow: 0 2px 6px rgba(102, 126, 234, 0.4);
                ">🔑 Access Token</button>
                <button id="toggle-payment-endpoint" class="toggle-btn" style="
                    padding: 10px 12px;
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 12px;
                    transition: all 0.3s;
                    box-shadow: 0 2px 6px rgba(245, 87, 108, 0.4);
                ">🔗 Payment Endpoint</button>
                <button id="toggle-captcha-endpoint" class="toggle-btn" style="
                    padding: 10px 12px;
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 12px;
                    transition: all 0.3s;
                    box-shadow: 0 2px 6px rgba(79, 172, 254, 0.4);
                ">🔐 Captcha Endpoint</button>
            </div>

            <!-- Collapsible Fields -->
            <div id="payment-access-token-container" style="display: none; margin-bottom: 15px;">
                <input type="text" id="payment-access-token" readonly style="
                    width: 100%;
                    padding: 8px;
                    border: 2px solid #667eea;
                    border-radius: 6px;
                    background: #f0f4ff;
                    font-size: 11px;
                    box-sizing: border-box;
                " placeholder="Access token from login">
            </div>

            <div id="payment-endpoint-container" style="display: none; margin-bottom: 15px;">
                <input type="text" id="payment-api-endpoint" value="${API_ENDPOINTS.payment.endpoint}" style="
                    width: 100%;
                    padding: 8px;
                    border: 2px solid #f5576c;
                    border-radius: 6px;
                    background: #fff0f3;
                    font-size: 11px;
                    box-sizing: border-box;
                ">
            </div>

            <div id="captcha-endpoint-container" style="display: none; margin-bottom: 15px;">
                <input type="text" id="payment-captcha-field-name" value="${API_ENDPOINTS.payment.captchaFieldName}" style="
                    width: 100%;
                    padding: 8px;
                    border: 2px solid #4facfe;
                    border-radius: 6px;
                    background: #f0f9ff;
                    font-size: 11px;
                    box-sizing: border-box;
                ">
            </div>

            <!-- OTP Verification -->
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333; font-size: 13px;">🔢 OTP Verification</label>
                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 10px;">
                    <input type="text" id="payment-otp" placeholder="Enter OTP" maxlength="7" style="
                        padding: 10px;
                        border: 2px solid #ddd;
                        border-radius: 6px;
                        box-sizing: border-box;
                        font-size: 14px;
                    ">
                    <button id="send-otp-btn" style="
                        padding: 10px 12px;
                        background: #17a2b8;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 12px;
                        font-weight: bold;
                    ">Send</button>
                    <button id="verify-otp-btn" style="
                        padding: 10px 12px;
                        background: #6c757d;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 12px;
                        font-weight: bold;
                    " disabled>Verify</button>
                </div>
            </div>

            <!-- Appointment Selection -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333; font-size: 13px;">📅 Appointment Date</label>
                    <select id="appointment-date" style="
                        width: 100%;
                        padding: 10px;
                        border: 2px solid #ddd;
                        border-radius: 6px;
                        box-sizing: border-box;
                        font-size: 14px;
                    ">
                        <option value="">Select date</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333; font-size: 13px;">⏰ Appointment Time</label>
                    <select id="appointment-time" style="
                        width: 100%;
                        padding: 10px;
                        border: 2px solid #ddd;
                        border-radius: 6px;
                        box-sizing: border-box;
                        font-size: 14px;
                    " disabled>
                        <option value="">Select time</option>
                    </select>
                </div>
            </div>

            <!-- Image Captcha Section -->
            <div id="payment-captcha-section" style="display: none; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 10px;">
                    <label style="font-weight: bold; color: #333; font-size: 13px;">🔐 Captcha Verification</label>
                    <div style="display: flex; gap: 10px;">
                        <button id="auto-read-captcha" style="
                            padding: 6px 12px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 11px;
                            font-weight: bold;
                            box-shadow: 0 2px 6px rgba(102, 126, 234, 0.4);
                        ">🤖 Auto Read</button>
                        <button id="refresh-payment-captcha" style="
                            padding: 6px 12px;
                            background: #17a2b8;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 11px;
                            font-weight: bold;
                        ">🔄 Refresh</button>
                    </div>
                </div>
                
                <!-- Captcha Image Display -->
                <div style="
                    margin-bottom: 10px;
                    border: 2px solid #ddd;
                    border-radius: 6px;
                    padding: 10px;
                    background: #f9f9f9;
                    text-align: center;
                    min-height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <img id="payment-captcha-image" src="" alt="Captcha" style="max-width: 100%; height: auto; display: none;">
                    <span id="payment-captcha-placeholder" style="color: #999; font-size: 12px;">Captcha will load after date & time selection</span>
                </div>

                <!-- Captcha Input and Verify Button -->
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px;">
                    <input type="text" id="payment-captcha-input" placeholder="Enter captcha text" maxlength="6" style="
                        padding: 10px;
                        border: 2px solid #ddd;
                        border-radius: 6px;
                        box-sizing: border-box;
                        font-size: 14px;
                    " autocomplete="off">
                    <button id="verify-payment-captcha-btn" style="
                        padding: 10px 12px;
                        background: #6c757d;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 12px;
                        font-weight: bold;
                    " disabled>Verify</button>
                </div>
                <div id="payment-captcha-error" style="
                    margin-top: 5px;
                    color: #dc3545;
                    font-size: 11px;
                    display: none;
                "></div>
                <div id="payment-captcha-success" style="
                    margin-top: 5px;
                    color: #28a745;
                    font-size: 11px;
                    display: none;
                ">✅ Captcha verified successfully!</div>
            </div>

            <!-- Utility Buttons -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <button id="pay-slot-time-btn" style="
                    padding: 10px 12px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 11px;
                    font-weight: bold;
                " disabled>Pay Slot Time</button>
                <button id="default-slot-btn" style="
                    padding: 10px 12px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 11px;
                    font-weight: bold;
                " disabled>Default Slot</button>
                <button id="default-date-btn" style="
                    padding: 10px 12px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 11px;
                    font-weight: bold;
                " disabled>Default Date</button>
            </div>

            <!-- Payment Action Buttons -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <button id="pay-now-btn" style="
                    padding: 14px 20px;
                    background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 14px;
                    box-shadow: 0 4px 15px rgba(235, 51, 73, 0.4);
                " disabled>💳 Pay Now</button>
                <button id="payment-btn" style="
                    padding: 14px 20px;
                    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 14px;
                    box-shadow: 0 4px 15px rgba(17, 153, 142, 0.4);
                " disabled>🔗 Payment</button>
            </div>

            <!-- Status Display -->
            <div id="payment-status" style="
                margin-top: 15px;
                padding: 12px;
                border-radius: 8px;
                background: linear-gradient(135deg, #e0f7fa 0%, #e1f5fe 100%);
                border: 2px solid #4dd0e1;
                font-size: 13px;
                line-height: 1.6;
                color: #00695c;
            ">
                ✅ Ready to start payment process...
            </div>
        `;
    }

    // ==========================================
    // TAB SWITCHING
    // ==========================================
    function setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;

                tabButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.style.background = 'rgba(255, 255, 255, 0.2)';
                    btn.style.color = 'white';
                });

                tabContents.forEach(content => {
                    content.classList.remove('active');
                    content.style.display = 'none';
                });

                button.classList.add('active');
                button.style.background = 'rgba(255, 255, 255, 0.95)';
                button.style.color = '#667eea';

                const targetContent = document.getElementById(`${targetTab}-tab`);
                if (targetContent) {
                    targetContent.classList.add('active');
                    targetContent.style.display = 'block';
                }

                // Sync tokens
                syncTokensAcrossTabs();
            });
        });
    }

    function syncTokensAcrossTabs() {
        const loginToken = document.getElementById('access-token-display').value;
        if (loginToken) {
            const bookingToken = document.getElementById('booking-access-token');
            const paymentToken = document.getElementById('payment-access-token');
            if (bookingToken) bookingToken.value = loginToken;
            if (paymentToken) paymentToken.value = loginToken;
        }
    }

    // ==========================================
    // EVENT LISTENERS
    // ==========================================
    function setupEventListeners() {
        // Panel controls
        document.getElementById('close-panel').addEventListener('click', () => {
            document.getElementById('ivac-assistant-main').remove();
            window.IVACAssistantLoaded = false;
        });

        document.getElementById('minimize-panel').addEventListener('click', toggleMinimize);

        // Setup tab-specific listeners
        setupLoginEventListeners();
        setupBookingEventListeners();
        setupPaymentEventListeners();
    }

    function setupLoginEventListeners() {
        // Toggle buttons
        document.getElementById('toggle-access-token').addEventListener('click', () => {
            toggleVisibility('access-token-container');
        });

        document.getElementById('toggle-captcha-token').addEventListener('click', () => {
            toggleVisibility('captcha-token-container');
        });

        // Load captcha
        document.getElementById('load-captcha').addEventListener('click', loadCloudflareWidget);

        // Auto login
        document.getElementById('start-auto-login').addEventListener('click', startAutoLogin);
        document.getElementById('stop-auto-login').addEventListener('click', stopAutoLogin);

        // Manual controls
        document.getElementById('verify-mobile').addEventListener('click', verifyMobile);
        document.getElementById('submit-password').addEventListener('click', submitPassword);
        document.getElementById('submit-otp').addEventListener('click', submitOTP);
    }

    function setupBookingEventListeners() {
        // Upload data
        document.getElementById('upload-data-btn').addEventListener('click', () => {
            document.getElementById('data-file-input').click();
        });

        document.getElementById('data-file-input').addEventListener('change', handleDataUpload);

        // Auto booking
        document.getElementById('start-auto-booking').addEventListener('click', startAutoBooking);
        document.getElementById('stop-booking').addEventListener('click', stopBooking);

        // Toggle access token
        document.getElementById('toggle-booking-access-token').addEventListener('click', () => {
            toggleVisibility('booking-access-token-container');
        });

        // Manual controls
        document.getElementById('submit-application-info').addEventListener('click', () => {
            submitApplicationInfoManual();
        });
        document.getElementById('submit-personal-info').addEventListener('click', submitPersonalInfo);
        document.getElementById('submit-overview').addEventListener('click', submitOverview);
    }

    function setupPaymentEventListeners() {
        // Toggle buttons
        document.getElementById('toggle-payment-access-token').addEventListener('click', () => {
            toggleVisibility('payment-access-token-container');
        });

        document.getElementById('toggle-payment-endpoint').addEventListener('click', () => {
            toggleVisibility('payment-endpoint-container');
        });

        document.getElementById('toggle-captcha-endpoint').addEventListener('click', () => {
            toggleVisibility('captcha-endpoint-container');
        });

        // OTP
        document.getElementById('send-otp-btn').addEventListener('click', () => sendPaymentOTP(0));
        document.getElementById('verify-otp-btn').addEventListener('click', verifyPaymentOTP);

        // Appointment
        document.getElementById('appointment-date').addEventListener('change', handleAppointmentDateChange);

        // Captcha handlers
        document.getElementById('refresh-payment-captcha').addEventListener('click', refreshPaymentCaptcha);
        document.getElementById('auto-read-captcha').addEventListener('click', attemptCaptchaOCR);
        document.getElementById('verify-payment-captcha-btn').addEventListener('click', verifyPaymentCaptcha);
        document.getElementById('payment-captcha-input').addEventListener('input', (e) => {
            const verifyBtn = document.getElementById('verify-payment-captcha-btn');
            verifyBtn.disabled = e.target.value.length < 6;
            verifyBtn.style.background = verifyBtn.disabled ? '#6c757d' : '#28a745';
        });

        // Utility buttons
        document.getElementById('pay-slot-time-btn').addEventListener('click', getPaymentSlotTime);
        document.getElementById('default-slot-btn').addEventListener('click', setDefaultSlot);
        document.getElementById('default-date-btn').addEventListener('click', setDefaultDateTime);

        // Payment buttons
        document.getElementById('pay-now-btn').addEventListener('click', submitPayment);
        document.getElementById('payment-btn').addEventListener('click', openPaymentLink);

        // Enable/disable OTP verify button
        document.getElementById('payment-otp').addEventListener('input', (e) => {
            const otpValue = e.target.value;
            const verifyBtn = document.getElementById('verify-otp-btn');
            verifyBtn.disabled = otpValue.length < 6;
            verifyBtn.style.background = verifyBtn.disabled ? '#6c757d' : '#28a745';
        });
    }

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================
    function toggleVisibility(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.style.display = container.style.display === 'none' ? 'block' : 'none';
        }
    }

    function makeDraggable(element) {
        const header = element.querySelector('#panel-header');
        let isDragging = false;
        let currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;

        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);

        function dragStart(e) {
            if (e.target.tagName === 'BUTTON') return;
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            if (e.target === header || header.contains(e.target)) {
                isDragging = true;
                header.style.cursor = 'grabbing';
            }
        }

        function dragMove(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;

                const rect = element.getBoundingClientRect();
                const maxX = window.innerWidth - rect.width;
                const maxY = window.innerHeight - rect.height;

                currentX = Math.max(0, Math.min(currentX, maxX));
                currentY = Math.max(0, Math.min(currentY, maxY));

                element.style.left = currentX + 'px';
                element.style.top = currentY + 'px';
                element.style.right = 'auto';
                element.style.bottom = 'auto';
            }
        }

        function dragEnd() {
            if (isDragging) {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
                header.style.cursor = 'move';
            }
        }
    }

    function makeResizable(element) {
        const resizeHandle = element.querySelector('#resize-handle');
        let isResizing = false;
        let startX, startY, startWidth, startHeight;

        resizeHandle.addEventListener('mousedown', initResize);
        document.addEventListener('mousemove', doResize);
        document.addEventListener('mouseup', stopResize);

        function initResize(e) {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(document.defaultView.getComputedStyle(element).width, 10);
            startHeight = parseInt(document.defaultView.getComputedStyle(element).height, 10);
            document.body.style.userSelect = 'none';
        }

        function doResize(e) {
            if (!isResizing) return;
            const width = startWidth + e.clientX - startX;
            const height = startHeight + e.clientY - startY;
            const minWidth = 450;
            const minHeight = 500;
            const maxWidth = window.innerWidth * 0.8;
            const maxHeight = window.innerHeight * 0.9;
            const newWidth = Math.max(minWidth, Math.min(width, maxWidth));
            const newHeight = Math.max(minHeight, Math.min(height, maxHeight));
            element.style.width = newWidth + 'px';
            element.style.height = newHeight + 'px';
        }

        function stopResize() {
            isResizing = false;
            document.body.style.userSelect = '';
        }
    }

    function toggleMinimize() {
        const content = document.getElementById('panel-content');
        const container = document.getElementById('ivac-assistant-main');
        const minimizeBtn = document.getElementById('minimize-panel');
        const tabNav = document.getElementById('tab-navigation');

        if (content.style.display === 'none') {
            content.style.display = 'block';
            tabNav.style.display = 'flex';
            container.style.height = 'auto';
            container.style.maxHeight = '90vh';
            minimizeBtn.innerHTML = '−';
        } else {
            content.style.display = 'none';
            tabNav.style.display = 'none';
            container.style.height = 'auto';
            container.style.maxHeight = 'none';
            minimizeBtn.innerHTML = '+';
        }
    }

    function loadPersistedData() {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            document.getElementById('access-token-display').value = accessToken;
            document.getElementById('booking-access-token').value = accessToken;
            document.getElementById('payment-access-token').value = accessToken;
        }
    }

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

    function updateBookingStatus(message, type = 'info') {
        const statusDiv = document.getElementById('booking-status');
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
        console.log(`[IVAC - Booking] ${message}`);
    }

    function updatePaymentStatus(message, type = 'info') {
        const statusDiv = document.getElementById('payment-status');
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
        console.log(`[IVAC - Payment] ${message}`);
    }

    // ==========================================
    // API HELPER FUNCTIONS
    // ==========================================
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

    async function retryableRequest(url, options, statusCallback, context = 'default') {
        let retryCount = 0;
        const maxRetries = 10;

        while (retryCount < maxRetries) {
            try {
                // Check if automation should stop
                if (context === 'login' && automationControl.login.stop) {
                    throw new Error('Automation stopped by user');
                }
                if (context === 'booking' && automationControl.booking.stop) {
                    throw new Error('Automation stopped by user');
                }

                const result = await customFetch(url, options);

                if (result.status === 200 || result.status_code === 200) {
                    return result;
                }

                // Stop immediately on 401 or 403
                if (result.status === 401 || result.status_code === 401 || 
                    result.status === 403 || result.status_code === 403) {
                    throw new Error(`${result.status || result.status_code} - Authentication/Authorization failed. Please login again.`);
                }

                if (result.status === 429 || result.status_code === 429) {
                    retryCount++;
                    // Different wait times for booking vs login
                    const waitTime = context === 'booking' ? 60 : (retryCount === 1 ? 30 : 60);
                    statusCallback(`Rate limit hit (429). Waiting ${waitTime} seconds... (Attempt ${retryCount}/${maxRetries})`, 'warning');
                    await sleep(waitTime * 1000);
                    continue;
                }

                if (result.status === 504 || result.status_code === 504) {
                    retryCount++;
                    statusCallback(`Server timeout (504). Retrying in 5 seconds... (Attempt ${retryCount}/${maxRetries})`, 'warning');
                    await sleep(5000);
                    continue;
                }

                if (result.status === 502 || result.status === 500 || result.status_code === 502 || result.status_code === 500) {
                    retryCount++;
                    statusCallback(`Server error (${result.status || result.status_code}). Retrying in 15 seconds... (Attempt ${retryCount}/${maxRetries})`, 'warning');
                    await sleep(15000);
                    continue;
                }

                // Other errors
                throw new Error(`Request failed with status ${result.status || result.status_code}: ${result.message || 'Unknown error'}`);

            } catch (error) {
                // Don't retry on 401, 403, or user stop
                if (error.message.includes('401') || error.message.includes('403') || 
                    error.message.includes('stopped') || error.message.includes('Authentication')) {
                    throw error;
                }
                
                retryCount++;
                if (retryCount >= maxRetries) {
                    throw new Error(`Max retries reached: ${error.message}`);
                }

                statusCallback(`Error: ${error.message}. Retrying... (${retryCount}/${maxRetries})`, 'error');
                await sleep(5000);
            }
        }

        throw new Error('Max retries exceeded');
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ==========================================
    // LOGIN TAB FUNCTIONS
    // ==========================================
    function loadCloudflareWidget() {
        updateStatus('🔄 Loading Cloudflare widget...', 'info');
        const container = document.getElementById('captcha-container');
        container.innerHTML = '';

        if (!window.turnstile) {
            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
            script.onload = () => renderWidget(CLOUDFLARE_SITEKEYS.login);
            document.head.appendChild(script);
        } else {
            renderWidget(CLOUDFLARE_SITEKEYS.login);
        }
    }

    function renderWidget(sitekey) {
        const container = document.getElementById('captcha-container');
        try {
            window.turnstile.render(container, {
                sitekey: sitekey,
                callback: function(token) {
                    document.getElementById('captcha-token').value = token;
                    updateStatus('✅ Captcha verified successfully!', 'success');
                },
                'error-callback': function() {
                    updateStatus('❌ Captcha verification failed', 'error');
                    document.getElementById('captcha-token').value = '';
                }
            });
            updateStatus('✅ Cloudflare widget loaded. Please complete verification.', 'info');
        } catch (error) {
            updateStatus('❌ Error loading Cloudflare widget: ' + error.message, 'error');
        }
    }

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

    function stopAutoLogin() {
        automationControl.login.stop = true;
        automationControl.login.running = false;
        updateStatus('⛔ Auto login stopped by user', 'warning');
        
        const startBtn = document.getElementById('start-auto-login');
        const stopBtn = document.getElementById('stop-auto-login');
        startBtn.style.display = 'block';
        stopBtn.style.display = 'none';
    }


    // ==========================================
    // BOOKING TAB FUNCTIONS
    // ==========================================
    function handleDataUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.txt')) {
            updateBookingStatus('⚠️ Please upload a .txt file', 'warning');
            return;
        }

        updateBookingStatus('🔄 Reading data file...', 'info');

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const content = e.target.result;
                parseDataFile(content);
                updateBookingStatus('✅ Data loaded successfully from file!', 'success');
            } catch (error) {
                updateBookingStatus(`❌ Error parsing file: ${error.message}`, 'error');
            }
        };
        reader.onerror = function() {
            updateBookingStatus('❌ Error reading file', 'error');
        };
        reader.readAsText(file);
    }

    function parseDataFile(content) {
        const lines = content.split('\n');
        const data = {};
        let currentSection = '';

        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith('#')) continue;

            if (line.startsWith('[') && line.endsWith(']')) {
                currentSection = line.slice(1, -1).toLowerCase();
                if (currentSection === 'family') {
                    data.family = {};
                }
                continue;
            }

            const [key, ...valueParts] = line.split('=');
            if (!key || valueParts.length === 0) continue;

            const value = valueParts.join('=').trim();
            const cleanKey = key.trim();

            if (currentSection === 'application') {
                APPLICATION_INFO[cleanKey] = value;
            } else if (currentSection === 'personal') {
                PERSONAL_INFO[cleanKey] = value;
            } else if (currentSection === 'family') {
                const familyMatch = cleanKey.match(/family\.(\d+)\.(\w+)/);
                if (familyMatch) {
                    const [, index, field] = familyMatch;
                    if (!PERSONAL_INFO.family[index]) {
                        PERSONAL_INFO.family[index] = {};
                    }
                    PERSONAL_INFO.family[index][field] = value;
                }
            }
        }

        console.log('Loaded Application Info:', APPLICATION_INFO);
        console.log('Loaded Personal Info:', PERSONAL_INFO);
    }

    async function startAutoBooking() {
        const accessToken = document.getElementById('booking-access-token').value.trim();
        if (!accessToken) {
            updateBookingStatus('⚠️ Please complete login first to get access token', 'warning');
            return;
        }

        automationControl.booking.running = true;
        automationControl.booking.stop = false;

        const startBtn = document.getElementById('start-auto-booking');
        startBtn.disabled = true;
        startBtn.style.opacity = '0.6';
        startBtn.textContent = '⏳ Auto Booking Running...';

        try {
            // Step 1: Load captcha
            updateBookingStatus('🔄 Step 1/4: Loading captcha...', 'info');
            await loadBookingCaptchaAuto();

            // Wait for captcha token
            let captchaToken = '';
            for (let i = 0; i < 60; i++) {
                if (automationControl.booking.stop) throw new Error('Stopped by user');
                
                captchaToken = document.getElementById('booking-captcha-token')?.value?.trim() || '';
                if (captchaToken) break;
                
                updateBookingStatus(`🔄 Step 1/4: Waiting for captcha verification... (${i+1}s)`, 'info');
                await sleep(1000);
            }

            if (!captchaToken) {
                throw new Error('Captcha verification timeout');
            }

            updateBookingStatus('✅ Step 1/4: Captcha verified!', 'success');
            await sleep(2000);

            // Step 2: Submit Application Info
            updateBookingStatus('🔄 Step 2/4: Submitting application info...', 'info');
            await submitApplicationInfoAuto(accessToken, captchaToken);
            updateBookingStatus('✅ Step 2/4: Application info submitted!', 'success');
            await sleep(30000); // Wait 30 seconds

            // Step 3: Submit Personal Info
            updateBookingStatus('🔄 Step 3/4: Submitting personal info...', 'info');
            await submitPersonalInfoAuto(accessToken);
            updateBookingStatus('✅ Step 3/4: Personal info submitted!', 'success');
            await sleep(30000); // Wait 30 seconds

            // Step 4: Submit Overview
            updateBookingStatus('🔄 Step 4/4: Submitting overview...', 'info');
            await submitOverviewAuto(accessToken);
            updateBookingStatus('🎉 Step 4/4: Booking completed successfully!', 'success');

        } catch (error) {
            updateBookingStatus(`❌ Auto booking failed: ${error.message}`, 'error');
        } finally {
            automationControl.booking.running = false;
            startBtn.disabled = false;
            startBtn.style.opacity = '1';
            startBtn.textContent = '🤖 Start Auto Booking';
        }
    }

    function stopBooking() {
        automationControl.booking.stop = true;
        automationControl.booking.running = false;
        updateBookingStatus('⛔ Booking automation stopped by user', 'warning');
    }

    async function loadBookingCaptchaAuto() {
        return new Promise((resolve, reject) => {
            const container = document.getElementById('booking-captcha-container');
            if (!container) {
                reject(new Error('Captcha container not found'));
                return;
            }

            container.style.display = 'block';
            container.innerHTML = '';

            const renderCaptcha = (sitekey) => {
                try {
                    window.turnstile.render(container, {
                        sitekey: sitekey,
                        callback: function(token) {
                            // Create hidden input if not exists
                            let tokenInput = document.getElementById('booking-captcha-token');
                            if (!tokenInput) {
                                tokenInput = document.createElement('input');
                                tokenInput.type = 'hidden';
                                tokenInput.id = 'booking-captcha-token';
                                document.body.appendChild(tokenInput);
                            }
                            tokenInput.value = token;
                            container.style.display = 'none';
                            resolve(token);
                        },
                        'error-callback': function() {
                            reject(new Error('Captcha verification failed'));
                        }
                    });
                } catch (error) {
                    reject(error);
                }
            };

            if (!window.turnstile) {
                const script = document.createElement('script');
                script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
                script.onload = () => renderCaptcha(CLOUDFLARE_SITEKEYS.booking);
                script.onerror = () => reject(new Error('Failed to load Turnstile script'));
                document.head.appendChild(script);
            } else {
                renderCaptcha(CLOUDFLARE_SITEKEYS.booking);
            }
        });
    }

    async function submitApplicationInfoAuto(accessToken, captchaToken) {
        const payload = {
            highcom: APPLICATION_INFO.highcom,
            webfile_id: APPLICATION_INFO.webfile_id,
            webfile_id_repeat: APPLICATION_INFO.webfile_id_repeat,
            ivac_id: APPLICATION_INFO.ivac_id,
            visa_type: APPLICATION_INFO.visa_type,
            family_count: APPLICATION_INFO.family_count,
            asweoi_erilfs: APPLICATION_INFO.visit_purpose,
            [API_ENDPOINTS.booking.captchaFieldName]: captchaToken
        };

        return await retryableRequest(
            API_ENDPOINTS.booking.applicationInfo,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'language': 'en',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: payload
            },
            updateBookingStatus,
            'booking'
        );
    }

    async function submitPersonalInfoAuto(accessToken) {
        const familyCount = parseInt(APPLICATION_INFO.family_count) || 0;
        const family = {};

        for (let i = 1; i <= familyCount; i++) {
            if (PERSONAL_INFO.family[i]) {
                family[i] = PERSONAL_INFO.family[i];
            }
        }

        const payload = {
            full_name: PERSONAL_INFO.full_name,
            email_name: PERSONAL_INFO.email_name,
            phone: PERSONAL_INFO.phone,
            webfile_id: APPLICATION_INFO.webfile_id,
            family: family
        };

        return await retryableRequest(
            API_ENDPOINTS.booking.personalInfo,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'language': 'en',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: payload
            },
            updateBookingStatus,
            'booking'
        );
    }

    async function submitOverviewAuto(accessToken) {
        return await retryableRequest(
            API_ENDPOINTS.booking.overview,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'language': 'en',
                    'Authorization': `Bearer ${accessToken}`
                }
            },
            updateBookingStatus,
            'booking'
        );
    }

    // Manual submission functions
    async function submitApplicationInfoManual() {
        const accessToken = document.getElementById('booking-access-token').value.trim();
        if (!accessToken) {
            updateBookingStatus('⚠️ Please complete login first', 'warning');
            return;
        }

        updateBookingStatus('🔄 Loading captcha for manual submission...', 'info');

        try {
            const captchaToken = await loadBookingCaptchaAuto();
            updateBookingStatus('🔄 Submitting application info...', 'info');
            
            await submitApplicationInfoAuto(accessToken, captchaToken);
            updateBookingStatus('✅ Application info submitted successfully!', 'success');
        } catch (error) {
            updateBookingStatus(`❌ Failed: ${error.message}`, 'error');
        }
    }

    async function submitPersonalInfo() {
        const accessToken = document.getElementById('booking-access-token').value.trim();
        if (!accessToken) {
            updateBookingStatus('⚠️ Please complete login first', 'warning');
            return;
        }

        updateBookingStatus('🔄 Submitting personal info...', 'info');

        try {
            await submitPersonalInfoAuto(accessToken);
            updateBookingStatus('✅ Personal info submitted successfully!', 'success');
        } catch (error) {
            updateBookingStatus(`❌ Failed: ${error.message}`, 'error');
        }
    }

    async function submitOverview() {
        const accessToken = document.getElementById('booking-access-token').value.trim();
        if (!accessToken) {
            updateBookingStatus('⚠️ Please complete login first', 'warning');
            return;
        }

        updateBookingStatus('🔄 Submitting overview...', 'info');

        try {
            await submitOverviewAuto(accessToken);
            updateBookingStatus('✅ Overview submitted successfully!', 'success');
        } catch (error) {
            updateBookingStatus(`❌ Failed: ${error.message}`, 'error');
        }
    }

    // ==========================================
    // PAYMENT TAB FUNCTIONS
    // ==========================================

    async function sendPaymentOTP(resend = 0) {
        const accessToken = document.getElementById('payment-access-token').value.trim();
        if (!accessToken) {
            updatePaymentStatus('⚠️ Please complete login first', 'warning');
            return;
        }

        updatePaymentStatus('🔄 Sending payment OTP...', 'info');
        const sendBtn = document.getElementById('send-otp-btn');
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';

        try {
            const result = await customFetch('/api/v2/payment/pay-otp-sent', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'language': 'en',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: { resend: resend }
            });

            if (result.status_code === 200) {
                updatePaymentStatus('✅ OTP sent successfully!', 'success');
                const verifyBtn = document.getElementById('verify-otp-btn');
                verifyBtn.disabled = false;
                verifyBtn.style.background = '#28a745';
                startOTPCountdown(30);
            } else {
                updatePaymentStatus(`❌ Failed to send OTP: ${result.message || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            updatePaymentStatus(`❌ Network error: ${error.message}`, 'error');
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send';
        }
    }

    async function verifyPaymentOTP() {
        const accessToken = document.getElementById('payment-access-token').value.trim();
        const otp = document.getElementById('payment-otp').value.trim();

        if (!accessToken) {
            updatePaymentStatus('⚠️ Please complete login first', 'warning');
            return;
        }

        if (otp.length < 6) {
            updatePaymentStatus('⚠️ Please enter 6 digit OTP', 'warning');
            return;
        }

        updatePaymentStatus('🔄 Verifying OTP...', 'info');
        const verifyBtn = document.getElementById('verify-otp-btn');
        verifyBtn.disabled = true;
        verifyBtn.textContent = 'Verifying...';

        try {
            const result = await customFetch('/api/v2/payment/pay-otp-verify', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'language': 'en',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: { otp: otp }
            });

            if (result.status_code === 200) {
                updatePaymentStatus('✅ OTP verified! Loading dates...', 'success');

                if (result.data && result.data.slot_dates) {
                    paymentData.slotDates = result.data.slot_dates;
                    populateAppointmentDates(result.data.slot_dates);
                }

                document.getElementById('pay-slot-time-btn').disabled = false;
                document.getElementById('pay-slot-time-btn').style.background = '#fd7e14';
                document.getElementById('default-slot-btn').disabled = false;
                document.getElementById('default-slot-btn').style.background = '#17a2b8';
                document.getElementById('default-date-btn').disabled = false;
                document.getElementById('default-date-btn').style.background = '#17a2b8';
            } else {
                updatePaymentStatus(`❌ OTP verification failed: ${result.message || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            updatePaymentStatus(`❌ Network error: ${error.message}`, 'error');
        } finally {
            verifyBtn.disabled = false;
            verifyBtn.textContent = 'Verify';
        }
    }

    function populateAppointmentDates(slotDates) {
        try {
            const dateSelect = document.getElementById('appointment-date');
            dateSelect.innerHTML = '<option value="">Select date</option>';
            let datesAdded = 0;

            if (Array.isArray(slotDates)) {
                slotDates.forEach((date) => {
                    const option = document.createElement('option');
                    option.value = date;
                    option.textContent = date;
                    dateSelect.appendChild(option);
                    datesAdded++;
                });
            } else if (typeof slotDates === 'object') {
                Object.entries(slotDates).forEach(([key, date]) => {
                    const option = document.createElement('option');
                    option.value = date;
                    option.textContent = date;
                    dateSelect.appendChild(option);
                    datesAdded++;
                });
            }

            if (datesAdded > 0) {
                updatePaymentStatus(`✅ ${datesAdded} dates loaded!`, 'success');
            }
        } catch (error) {
            console.error('Date population error:', error);
        }
    }

    async function handleAppointmentDateChange(event) {
        const selectedDate = event.target.value;
        if (!selectedDate) return;

        const accessToken = document.getElementById('payment-access-token').value.trim();
        updatePaymentStatus('🔄 Loading times and captcha...', 'info');

        try {
            const result = await customFetch('/api/v2/payment/pay-slot-time', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'language': 'en',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: {
                    appointment_date: selectedDate
                }
            });

            if (result.status_code === 200 && result.data) {
                // Get slot times
                if (result.data.slot_times) {
                    paymentData.slotTimes = result.data.slot_times;
                    populateAppointmentTimes(result.data.slot_times);
                }

                // IMPORTANT: Get captcha from the same response
                if (result.data.captcha) {
                    paymentData.captchaImage = result.data.captcha.captcha_image;
                    paymentData.captchaId = result.data.captcha.captcha_id;
                    paymentData.captchaVerified = false;

                    // Display the captcha
                    const captchaSection = document.getElementById('payment-captcha-section');
                    const captchaImg = document.getElementById('payment-captcha-image');
                    const placeholder = document.getElementById('payment-captcha-placeholder');
                    
                    if (captchaSection) {
                        captchaSection.style.display = 'block';
                    }
                    
                    if (captchaImg && placeholder) {
                        captchaImg.src = result.data.captcha.captcha_image;
                        captchaImg.style.display = 'block';
                        placeholder.style.display = 'none';
                    }

                    // Clear previous input
                    document.getElementById('payment-captcha-input').value = '';
                    document.getElementById('payment-captcha-error').style.display = 'none';
                    document.getElementById('payment-captcha-success').style.display = 'none';

                    updatePaymentStatus('✅ Times and captcha loaded!', 'success');
                } else {
                    updatePaymentStatus('✅ Times loaded!', 'success');
                }
            }
        } catch (error) {
            updatePaymentStatus(`❌ Error: ${error.message}`, 'error');
        }
    }

    function populateAppointmentTimes(slotTimes) {
        const timeSelect = document.getElementById('appointment-time');
        timeSelect.innerHTML = '<option value="">Select time</option>';
        timeSelect.disabled = false;

        slotTimes.forEach(slot => {
            const option = document.createElement('option');
            option.value = slot.time_display;
            option.textContent = slot.time_display;
            timeSelect.appendChild(option);
        });

        // Check payment readiness when time is selected
        timeSelect.addEventListener('change', checkPaymentReadiness);
    }

    async function refreshPaymentCaptcha() {
        const accessToken = document.getElementById('payment-access-token').value.trim();
        const selectedDate = document.getElementById('appointment-date').value;
        
        if (!accessToken) {
            updatePaymentStatus('⚠️ Please complete login first', 'warning');
            return;
        }

        if (!selectedDate) {
            updatePaymentStatus('⚠️ Please select a date first', 'warning');
            return;
        }

        try {
            updatePaymentStatus('🔄 Refreshing captcha...', 'info');
            
            // Call the slot-time endpoint again to get fresh captcha
            const result = await customFetch('/api/v2/payment/pay-slot-time', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'language': 'en',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: {
                    appointment_date: selectedDate
                }
            });

            if (result.status_code === 200 && result.data && result.data.captcha) {
                paymentData.captchaImage = result.data.captcha.captcha_image;
                paymentData.captchaId = result.data.captcha.captcha_id;
                paymentData.captchaVerified = false;

                const captchaImg = document.getElementById('payment-captcha-image');
                if (captchaImg) {
                    captchaImg.src = result.data.captcha.captcha_image;
                }

                document.getElementById('payment-captcha-input').value = '';
                document.getElementById('payment-captcha-error').style.display = 'none';
                document.getElementById('payment-captcha-success').style.display = 'none';

                updatePaymentStatus('✅ Captcha refreshed!', 'info');
                checkPaymentReadiness();
            }
        } catch (error) {
            updatePaymentStatus(`❌ Error refreshing captcha: ${error.message}`, 'error');
        }
    }

    // OCR Function
    async function attemptCaptchaOCR() {
        const captchaImg = document.getElementById('payment-captcha-image');
        const autoReadBtn = document.getElementById('auto-read-captcha');
        
        if (!captchaImg || !captchaImg.src) {
            updatePaymentStatus('⚠️ No captcha image loaded', 'warning');
            return;
        }

        try {
            autoReadBtn.disabled = true;
            autoReadBtn.textContent = '⏳ Reading...';
            updatePaymentStatus('🔄 Attempting to read captcha with OCR...', 'info');
            
            // Load Tesseract.js if not already loaded
            if (!window.Tesseract) {
                updatePaymentStatus('🔄 Loading OCR library (first time only, ~2MB)...', 'info');
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js';
                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
                ocrControl.loaded = true;
            }

            ocrControl.processing = true;
            
            const { data: { text } } = await Tesseract.recognize(
                captchaImg.src,
                'eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            const progress = Math.round(m.progress * 100);
                            autoReadBtn.textContent = `⏳ ${progress}%`;
                        }
                    }
                }
            );

            // Clean the text (remove spaces, newlines, special chars, keep only alphanumeric)
            const cleanedText = text.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6);
            
            if (cleanedText.length === 6) {
                document.getElementById('payment-captcha-input').value = cleanedText;
                updatePaymentStatus('✅ Captcha read: "' + cleanedText + '". Please verify it\'s correct before submitting.', 'success');
                
                // Enable verify button
                document.getElementById('verify-payment-captcha-btn').disabled = false;
                document.getElementById('verify-payment-captcha-btn').style.background = '#28a745';
            } else if (cleanedText.length > 0) {
                document.getElementById('payment-captcha-input').value = cleanedText;
                updatePaymentStatus(`⚠️ OCR read "${cleanedText}" (${cleanedText.length} chars). Please check and correct if needed.`, 'warning');
            } else {
                updatePaymentStatus('⚠️ Could not read captcha clearly. Please enter manually.', 'warning');
            }
        } catch (error) {
            updatePaymentStatus('⚠️ OCR failed. Please enter captcha manually.', 'warning');
            console.error('OCR Error:', error);
        } finally {
            ocrControl.processing = false;
            autoReadBtn.disabled = false;
            autoReadBtn.textContent = '🤖 Auto Read';
        }
    }

    async function verifyPaymentCaptcha() {
        const accessToken = document.getElementById('payment-access-token').value.trim();
        const captchaInput = document.getElementById('payment-captcha-input').value.trim();
        const errorDiv = document.getElementById('payment-captcha-error');
        const successDiv = document.getElementById('payment-captcha-success');

        if (!accessToken) {
            updatePaymentStatus('⚠️ Please complete login first', 'warning');
            return;
        }

        if (captchaInput.length < 6) {
            errorDiv.textContent = 'Please enter the 6-digit captcha';
            errorDiv.style.display = 'block';
            return;
        }

        try {
            const verifyBtn = document.getElementById('verify-payment-captcha-btn');
            verifyBtn.disabled = true;
            verifyBtn.textContent = 'Verifying...';
            
            errorDiv.style.display = 'none';
            successDiv.style.display = 'none';

            const result = await customFetch(API_ENDPOINTS.payment.verifyCaptcha, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'language': 'en',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: {
                    captcha_id: paymentData.captchaId,
                    captcha_input: captchaInput
                }
            });

            if (result.status_code === 200) {
                paymentData.captchaVerified = true;
                successDiv.style.display = 'block';
                updatePaymentStatus('✅ Captcha verified successfully!', 'success');
                checkPaymentReadiness();
            } else {
                paymentData.captchaVerified = false;
                errorDiv.textContent = result.message || 'Captcha verification failed. Refreshing...';
                errorDiv.style.display = 'block';
                // Automatically reload captcha after failed verification
                setTimeout(refreshPaymentCaptcha, 1000);
            }
        } catch (error) {
            paymentData.captchaVerified = false;
            errorDiv.textContent = `Error: ${error.message}`;
            errorDiv.style.display = 'block';
        } finally {
            const verifyBtn = document.getElementById('verify-payment-captcha-btn');
            verifyBtn.disabled = false;
            verifyBtn.textContent = 'Verify';
        }
    }

    async function getPaymentSlotTime() {
        const accessToken = document.getElementById('payment-access-token').value.trim();
        const selectedDate = document.getElementById('appointment-date').value;

        if (!selectedDate) {
            updatePaymentStatus('⚠️ Please select a date first', 'warning');
            return;
        }

        updatePaymentStatus('🔄 Fetching slot times...', 'info');

        try {
            const result = await customFetch('/api/v2/payment/pay-slot-time', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'language': 'en',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: { appointment_date: selectedDate }
            });

            if (result.status_code === 200 && result.data && result.data.slot_times) {
                paymentData.slotTimes = result.data.slot_times;
                populateAppointmentTimes(result.data.slot_times);
                updatePaymentStatus('✅ Slot times loaded!', 'success');
            }
        } catch (error) {
            updatePaymentStatus(`❌ Error: ${error.message}`, 'error');
        }
    }

    function setDefaultSlot() {
        const timeSelect = document.getElementById('appointment-time');
        const defaultTime = '09:00 - 09:59';

        let defaultOption = Array.from(timeSelect.options).find(option => option.value === defaultTime);
        if (!defaultOption) {
            defaultOption = document.createElement('option');
            defaultOption.value = defaultTime;
            defaultOption.textContent = defaultTime;
            timeSelect.appendChild(defaultOption);
        }

        timeSelect.value = defaultTime;
        timeSelect.disabled = false;
        updatePaymentStatus(`✅ Default slot set: ${defaultTime}`, 'info');
        checkPaymentReadiness();
    }

    function setDefaultDateTime() {
        const dateSelect = document.getElementById('appointment-date');
        const timeSelect = document.getElementById('appointment-time');
        
        const currentDate = new Date();
        const defaultDate = new Date(currentDate);
        defaultDate.setDate(currentDate.getDate() + 7);
        const defaultDateString = defaultDate.toISOString().split('T')[0];

        let defaultDateOption = Array.from(dateSelect.options).find(option => option.value === defaultDateString);
        if (!defaultDateOption) {
            defaultDateOption = document.createElement('option');
            defaultDateOption.value = defaultDateString;
            defaultDateOption.textContent = defaultDateString;
            dateSelect.appendChild(defaultDateOption);
        }

        dateSelect.value = defaultDateString;

        const defaultTime = '09:00 - 09:59';
        let defaultTimeOption = Array.from(timeSelect.options).find(option => option.value === defaultTime);
        if (!defaultTimeOption) {
            defaultTimeOption = document.createElement('option');
            defaultTimeOption.value = defaultTime;
            defaultTimeOption.textContent = defaultTime;
            timeSelect.appendChild(defaultTimeOption);
        }

        timeSelect.value = defaultTime;
        timeSelect.disabled = false;

        updatePaymentStatus(`✅ Default date & time set: ${defaultDateString} at ${defaultTime}`, 'success');
        checkPaymentReadiness();
    }

    function checkPaymentReadiness() {
        const appointmentDate = document.getElementById('appointment-date').value;
        const appointmentTime = document.getElementById('appointment-time').value;
        const accessToken = document.getElementById('payment-access-token').value;

        // Check captcha verification
        const isReady = appointmentDate && appointmentTime && accessToken && paymentData.captchaVerified;

        const payNowBtn = document.getElementById('pay-now-btn');
        payNowBtn.disabled = !isReady;
        payNowBtn.style.opacity = isReady ? '1' : '0.6';

        if (isReady) {
            updatePaymentStatus('✅ Ready to submit payment!', 'success');
        }
    }

    async function submitPayment() {
        const accessToken = document.getElementById('payment-access-token').value.trim();
        const appointmentDate = document.getElementById('appointment-date').value;
        const appointmentTime = document.getElementById('appointment-time').value;
        const captchaFieldName = document.getElementById('payment-captcha-field-name').value;
        const apiEndpoint = document.getElementById('payment-api-endpoint').value;

        // Hardcoded VISA payment method
        const paymentMethod = {
            name: 'VISA',
            slug: 'visacard',
            link: 'https://securepay.sslcommerz.com/gwprocess/v4/image/gw1/visa.png'
        };

        if (!accessToken || !appointmentDate || !appointmentTime || !paymentData.captchaVerified) {
            updatePaymentStatus('⚠️ Please complete all required fields and verify captcha', 'warning');
            return;
        }

        updatePaymentStatus('🔄 Submitting payment...', 'info');
        const payNowBtn = document.getElementById('pay-now-btn');
        payNowBtn.disabled = true;
        payNowBtn.textContent = '⏳ Processing...';

        try {
            const payload = {
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                selected_payment: paymentMethod,
                [captchaFieldName]: paymentData.captchaId  // Use captcha_id
            };

            const result = await customFetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'language': 'en',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: payload
            });

            if (result.status_code === 200) {
                updatePaymentStatus('✅ Payment request successful!', 'success');
                paymentData.paymentUrl = result.data.url;

                const paymentBtn = document.getElementById('payment-btn');
                paymentBtn.disabled = false;
                paymentBtn.style.opacity = '1';

                const autoRedirect = confirm('Payment URL received! Redirect to payment gateway now?\n\nOK = Redirect | Cancel = Use Payment button');
                if (autoRedirect) {
                    window.location.href = result.data.url;
                }
            } else {
                updatePaymentStatus(`❌ Payment failed: ${result.message || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            updatePaymentStatus(`❌ Network error: ${error.message}`, 'error');
        } finally {
            payNowBtn.disabled = false;
            payNowBtn.textContent = '💳 Pay Now';
        }
    }

    function openPaymentLink() {
        if (paymentData.paymentUrl) {
            window.open(paymentData.paymentUrl, '_blank');
            updatePaymentStatus('✅ Payment gateway opened in new tab', 'success');
        } else {
            updatePaymentStatus('⚠️ No payment URL available', 'warning');
        }
    }

    function startOTPCountdown(seconds) {
        const sendBtn = document.getElementById('send-otp-btn');
        let remainingTime = seconds;

        const timer = setInterval(() => {
            if (remainingTime > 0) {
                sendBtn.textContent = `Resend (${remainingTime}s)`;
                sendBtn.disabled = true;
                remainingTime--;
            } else {
                sendBtn.textContent = 'Resend';
                sendBtn.disabled = false;
                clearInterval(timer);
            }
        }, 1000);
    }

})();
