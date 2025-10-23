/**
 * IVAC Login Assistant v2.3 - Bookmarklet Version
 * Complete IVAC automation with hardcoded personal info
 * Compatible with bookmarklet loader method
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
    const PERSONAL_INFO = {
        full_name: 'NAJNEN SULTANA',
        email_name: 'najnensultana87@gmail.com',
        phone: '01889844184',
        webfile_id: 'BGDCV0F0A525',

        family: {
            1: {
                name: 'MD PERVES',
                webfile_no: 'BGDCV0F0A925',
                again_webfile_no: 'BGDCV0F0A925'
            },
            2: {
                name: 'CHANDA RANI DAS',
                webfile_no: 'BGDCV0ECB825',
                again_webfile_no: 'BGDCV0ECB825'
            },
            3: {
                name: 'RAJESH KUMAR DAS',
                webfile_no: 'BGDCV0ECC125',
                again_webfile_no: 'BGDCV0ECC125'
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

    // Global state objects
    const loginState = {
        accessToken: '',
        refreshToken: '',
        userInfo: null,
        isLoggedIn: false
    };

    const bookingState = {
        applicationInfo: null,
        selectedCenter: null,
        availableDates: [],
        selectedDate: null,
        selectedSlot: null,
        isPurchaseFlow: false
    };

    const paymentData = {
        paymentUrl: null,
        appointmentDate: null,
        appointmentTime: null
    };

    // Initialize script immediately (no DOMContentLoaded wait needed for bookmarklet)
    function initScript() {
        // Small delay to ensure page is ready
        setTimeout(createMainPanel, 500);
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
            width: 450px;
            min-width: 400px;
            background: white;
            border: 2px solid #333;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            max-height: 85vh;
            resize: both;
            overflow: auto;
        `;

        container.innerHTML = `
            <div id="panel-header" style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 20px;
                border-radius: 8px 8px 0 0;
                cursor: move;
                user-select: none;
                position: relative;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <h3 style="margin: 0; font-size: 16px; font-weight: bold;">IVAC Complete Assistant v2.3</h3>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button id="minimize-panel" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        width: 24px;
                        height: 24px;
                        border-radius: 4px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 14px;
                    ">−</button>
                    <button id="close-panel" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        width: 24px;
                        height: 24px;
                        border-radius: 4px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 16px;
                    ">×</button>
                </div>
            </div>

            <div id="tab-navigation" style="
                background: #f8f9fa;
                border-bottom: 1px solid #dee2e6;
                display: flex;
            ">
                <button class="tab-button active" data-tab="login" style="
                    flex: 1;
                    padding: 12px 16px;
                    border: none;
                    background: #007bff;
                    color: white;
                    cursor: pointer;
                    border-right: 1px solid #dee2e6;
                    font-size: 12px;
                    font-weight: bold;
                ">IVAC Login</button>
                <button class="tab-button" data-tab="booking" style="
                    flex: 1;
                    padding: 12px 16px;
                    border: none;
                    background: #f8f9fa;
                    color: #333;
                    cursor: pointer;
                    border-right: 1px solid #dee2e6;
                    font-size: 12px;
                    font-weight: bold;
                ">App Booking</button>
                <button class="tab-button" data-tab="payment" style="
                    flex: 1;
                    padding: 12px 16px;
                    border: none;
                    background: #f8f9fa;
                    color: #333;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: bold;
                ">Payment</button>
            </div>

            <div id="panel-content" style="padding: 20px;">
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
                background: linear-gradient(-45deg, transparent 0%, transparent 40%, #ccc 40%, #ccc 60%, transparent 60%);
                cursor: nw-resize;
                border-radius: 0 0 8px 0;
            "></div>
        `;

        document.body.appendChild(container);

        // Setup all event listeners after DOM is ready
        setupEventListeners();
        setupTabSwitching();
        makeDraggable(container);
        makeResizable(container);
    }

    function createLoginTabContent() {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="background: #e8f4fd; padding: 10px; border-radius: 6px; font-size: 12px;">
                    <strong>📋 Instructions:</strong><br>
                    1. Enter email/phone & OTP<br>
                    2. Complete captcha<br>
                    3. Click Login<br>
                    4. Switch to App Booking tab
                </div>

                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Email/Phone:</label>
                    <input type="text" id="login-email" 
                           value="${PERSONAL_INFO.email_name}" 
                           style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;" 
                           placeholder="Enter email or phone">
                </div>

                <div style="display: flex; gap: 8px;">
                    <div style="flex: 1;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">OTP:</label>
                        <input type="text" id="login-otp" 
                               style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;" 
                               placeholder="Enter OTP">
                    </div>
                    <div style="display: flex; align-items: flex-end;">
                        <button id="send-otp-btn" style="
                            padding: 8px 16px;
                            background: #28a745;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-weight: bold;
                            white-space: nowrap;
                        ">Send OTP</button>
                    </div>
                </div>

                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Cloudflare Sitekey:</label>
                    <input type="text" id="login-sitekey" 
                           value="${CLOUDFLARE_SITEKEYS.login}" 
                           style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; font-size: 11px;" 
                           placeholder="Enter sitekey">
                    <button id="load-login-captcha-btn" style="
                        margin-top: 5px;
                        padding: 6px 12px;
                        background: #17a2b8;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                    ">Load Captcha</button>
                </div>

                <div id="login-captcha-container" style="margin: 10px 0;"></div>
                <input type="hidden" id="login-captcha-token">

                <button id="login-btn" style="
                    width: 100%;
                    padding: 12px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: bold;
                " disabled>Login</button>

                <div id="login-status" style="
                    padding: 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    display: none;
                "></div>

                <div id="login-token-display" style="display: none; margin-top: 10px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Access Token:</label>
                    <textarea id="login-access-token" readonly style="
                        width: 100%;
                        height: 60px;
                        padding: 8px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        font-size: 11px;
                        font-family: monospace;
                        resize: vertical;
                        box-sizing: border-box;
                    "></textarea>
                    <button id="copy-token-btn" style="
                        margin-top: 5px;
                        padding: 6px 12px;
                        background: #6c757d;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                    ">Copy Token</button>
                </div>
            </div>
        `;
    }

    function createBookingTabContent() {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="background: #fff3cd; padding: 10px; border-radius: 6px; font-size: 12px;">
                    <strong>📋 Instructions:</strong><br>
                    1. Enter Access Token from Login<br>
                    2. Load App Info & Select Center<br>
                    3. Select Date & Time Slot<br>
                    4. Complete Booking
                </div>

                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Access Token:</label>
                    <textarea id="booking-access-token" style="
                        width: 100%;
                        height: 60px;
                        padding: 8px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        font-size: 11px;
                        font-family: monospace;
                        resize: vertical;
                        box-sizing: border-box;
                    " placeholder="Paste access token from login"></textarea>
                </div>

                <button id="load-app-info-btn" style="
                    width: 100%;
                    padding: 10px;
                    background: #17a2b8;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                ">Load Application Info</button>

                <div id="booking-center-section" style="display: none;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Select Visa Center:</label>
                    <select id="booking-center-select" style="
                        width: 100%;
                        padding: 8px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        box-sizing: border-box;
                    ">
                        <option value="">Select a center...</option>
                    </select>
                </div>

                <div id="booking-date-section" style="display: none;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Available Dates:</label>
                    <select id="booking-date-select" style="
                        width: 100%;
                        padding: 8px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        box-sizing: border-box;
                    " disabled>
                        <option value="">Select a date...</option>
                    </select>
                </div>

                <div id="booking-slot-section" style="display: none;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Available Slots:</label>
                    <select id="booking-slot-select" style="
                        width: 100%;
                        padding: 8px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        box-sizing: border-box;
                    " disabled>
                        <option value="">Select a slot...</option>
                    </select>
                </div>

                <div id="booking-captcha-section" style="display: none;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Cloudflare Sitekey:</label>
                    <input type="text" id="booking-sitekey" 
                           value="${CLOUDFLARE_SITEKEYS.booking}" 
                           style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; font-size: 11px;">
                    <button id="load-booking-captcha-btn" style="
                        margin-top: 5px;
                        padding: 6px 12px;
                        background: #17a2b8;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                    ">Load Booking Captcha</button>
                    <div id="booking-captcha-container" style="margin: 10px 0;"></div>
                    <input type="hidden" id="booking-captcha-token">
                </div>

                <button id="book-appointment-btn" style="
                    width: 100%;
                    padding: 12px;
                    background: #28a745;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: bold;
                " disabled>Book Appointment</button>

                <div id="booking-status" style="
                    padding: 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    display: none;
                "></div>
            </div>
        `;
    }

    function createPaymentTabContent() {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="background: #f8d7da; padding: 10px; border-radius: 6px; font-size: 12px;">
                    <strong>📋 Instructions:</strong><br>
                    1. Enter Access Token<br>
                    2. Select appointment date & time<br>
                    3. Complete payment captcha<br>
                    4. Click Pay Now
                </div>

                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Access Token:</label>
                    <textarea id="payment-access-token" style="
                        width: 100%;
                        height: 60px;
                        padding: 8px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        font-size: 11px;
                        font-family: monospace;
                        resize: vertical;
                        box-sizing: border-box;
                    " placeholder="Paste access token"></textarea>
                </div>

                <div style="display: flex; gap: 8px;">
                    <div style="flex: 1;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Appointment Date:</label>
                        <input type="text" id="appointment-date" 
                               style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;" 
                               placeholder="YYYY-MM-DD">
                    </div>
                    <div style="flex: 1;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Time:</label>
                        <select id="appointment-time" style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #ccc;
                            border-radius: 4px;
                            box-sizing: border-box;
                        " disabled>
                            <option value="">Select time...</option>
                        </select>
                    </div>
                </div>

                <button id="fetch-appointment-btn" style="
                    width: 100%;
                    padding: 8px;
                    background: #17a2b8;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 12px;
                ">Fetch Available Slots</button>

                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Payment Method:</label>
                    <div style="display: flex; gap: 15px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="radio" name="payment-method" value="visacard" checked style="margin-right: 5px;">
                            VISA Card
                        </label>
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="radio" name="payment-method" value="master" style="margin-right: 5px;">
                            Master Card
                        </label>
                    </div>
                </div>

                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Cloudflare Sitekey:</label>
                    <input type="text" id="payment-sitekey" 
                           value="${CLOUDFLARE_SITEKEYS.payment}" 
                           style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; font-size: 11px;">
                    <button id="load-payment-captcha-btn" style="
                        margin-top: 5px;
                        padding: 6px 12px;
                        background: #17a2b8;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                    ">Load Payment Captcha</button>
                </div>

                <div id="payment-captcha-container" style="margin: 10px 0;"></div>
                <input type="hidden" id="payment-captcha-token">
                <input type="hidden" id="payment-captcha-field-name" value="cf-turnstile-response">
                <input type="hidden" id="payment-api-endpoint" value="https://payment.ivacbd.com/api/save_payment">

                <button id="pay-now-btn" style="
                    width: 100%;
                    padding: 12px;
                    background: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: bold;
                " disabled>Pay Now</button>

                <button id="payment-btn" style="
                    width: 100%;
                    padding: 10px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    display: none;
                ">Open Payment Gateway</button>

                <div id="payment-status" style="
                    padding: 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    display: none;
                "></div>
            </div>
        `;
    }

    function setupEventListeners() {
        // Panel controls
        const closeBtn = document.getElementById('close-panel');
        const minimizeBtn = document.getElementById('minimize-panel');
        
        if (closeBtn) {
            closeBtn.onclick = () => {
                document.getElementById('ivac-assistant-main').remove();
                window.IVACAssistantLoaded = false;
            };
        }

        if (minimizeBtn) {
            minimizeBtn.onclick = () => {
                const content = document.getElementById('panel-content');
                const tabNav = document.getElementById('tab-navigation');
                if (content.style.display === 'none') {
                    content.style.display = 'block';
                    tabNav.style.display = 'flex';
                    minimizeBtn.textContent = '−';
                } else {
                    content.style.display = 'none';
                    tabNav.style.display = 'none';
                    minimizeBtn.textContent = '+';
                }
            };
        }

        // Login tab events
        setupLoginEvents();

        // Booking tab events
        setupBookingEvents();

        // Payment tab events
        setupPaymentEvents();
    }

    function setupLoginEvents() {
        const sendOtpBtn = document.getElementById('send-otp-btn');
        const loadCaptchaBtn = document.getElementById('load-login-captcha-btn');
        const loginBtn = document.getElementById('login-btn');
        const copyTokenBtn = document.getElementById('copy-token-btn');

        if (sendOtpBtn) {
            sendOtpBtn.onclick = sendOTP;
        }

        if (loadCaptchaBtn) {
            loadCaptchaBtn.onclick = loadLoginCaptcha;
        }

        if (loginBtn) {
            loginBtn.onclick = performLogin;
        }

        if (copyTokenBtn) {
            copyTokenBtn.onclick = () => {
                const tokenField = document.getElementById('login-access-token');
                tokenField.select();
                document.execCommand('copy');
                updateLoginStatus('Token copied to clipboard!', 'success');
            };
        }

        // Enable login button when all fields are filled
        const otpInput = document.getElementById('login-otp');
        if (otpInput) {
            otpInput.oninput = checkLoginReadiness;
        }
    }

    function setupBookingEvents() {
        const loadAppInfoBtn = document.getElementById('load-app-info-btn');
        const centerSelect = document.getElementById('booking-center-select');
        const dateSelect = document.getElementById('booking-date-select');
        const slotSelect = document.getElementById('booking-slot-select');
        const loadCaptchaBtn = document.getElementById('load-booking-captcha-btn');
        const bookBtn = document.getElementById('book-appointment-btn');

        if (loadAppInfoBtn) {
            loadAppInfoBtn.onclick = loadApplicationInfo;
        }

        if (centerSelect) {
            centerSelect.onchange = handleCenterSelection;
        }

        if (dateSelect) {
            dateSelect.onchange = handleDateSelection;
        }

        if (slotSelect) {
            slotSelect.onchange = handleSlotSelection;
        }

        if (loadCaptchaBtn) {
            loadCaptchaBtn.onclick = loadBookingCaptcha;
        }

        if (bookBtn) {
            bookBtn.onclick = bookAppointment;
        }
    }

    function setupPaymentEvents() {
        const fetchAppointmentBtn = document.getElementById('fetch-appointment-btn');
        const loadCaptchaBtn = document.getElementById('load-payment-captcha-btn');
        const payNowBtn = document.getElementById('pay-now-btn');
        const paymentBtn = document.getElementById('payment-btn');

        if (fetchAppointmentBtn) {
            fetchAppointmentBtn.onclick = fetchAppointmentSlots;
        }

        if (loadCaptchaBtn) {
            loadCaptchaBtn.onclick = loadPaymentCaptcha;
        }

        if (payNowBtn) {
            payNowBtn.onclick = submitPayment;
        }

        if (paymentBtn) {
            paymentBtn.onclick = openPaymentLink;
        }

        // Monitor inputs for payment readiness
        const dateInput = document.getElementById('appointment-date');
        const timeSelect = document.getElementById('appointment-time');
        const tokenInput = document.getElementById('payment-access-token');

        if (dateInput) dateInput.oninput = checkPaymentReadiness;
        if (timeSelect) timeSelect.onchange = checkPaymentReadiness;
        if (tokenInput) tokenInput.oninput = checkPaymentReadiness;
    }

    function setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-button');
        
        tabButtons.forEach(button => {
            button.onclick = () => {
                const tabName = button.getAttribute('data-tab');
                
                // Update button states
                tabButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.style.background = '#f8f9fa';
                    btn.style.color = '#333';
                });
                
                button.classList.add('active');
                button.style.background = '#007bff';
                button.style.color = 'white';
                
                // Update content visibility
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.style.display = 'none';
                });
                
                const targetTab = document.getElementById(`${tabName}-tab`);
                if (targetTab) {
                    targetTab.style.display = 'block';
                }
            };
        });
    }

    function makeDraggable(element) {
        const header = element.querySelector('#panel-header');
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        header.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + 'px';
            element.style.left = (element.offsetLeft - pos1) + 'px';
            element.style.right = 'auto';
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    function makeResizable(element) {
        const handle = element.querySelector('#resize-handle');
        let isResizing = false;
        let startX, startY, startWidth, startHeight;

        handle.onmousedown = (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = element.offsetWidth;
            startHeight = element.offsetHeight;
            e.preventDefault();
        };

        document.onmousemove = (e) => {
            if (!isResizing) return;
            
            const width = startWidth + (e.clientX - startX);
            const height = startHeight + (e.clientY - startY);
            
            if (width > 300) element.style.width = width + 'px';
            if (height > 200) element.style.height = height + 'px';
        };

        document.onmouseup = () => {
            isResizing = false;
        };
    }

    // Custom fetch function with proper error handling
    async function customFetch(url, options = {}) {
        try {
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers
            };

            const fetchOptions = {
                method: options.method || 'GET',
                headers: headers,
                credentials: 'include'
            };

            if (options.body) {
                fetchOptions.body = JSON.stringify(options.body);
            }

            const response = await fetch(url, fetchOptions);
            const data = await response.json();

            if (!response.ok) {
                const error = new Error(data.message || 'Request failed');
                error.status = response.status;
                error.data = data;
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    // LOGIN TAB FUNCTIONS
    async function sendOTP() {
        const email = document.getElementById('login-email').value.trim();
        
        if (!email) {
            updateLoginStatus('Please enter email/phone', 'error');
            return;
        }

        updateLoginStatus('Sending OTP...', 'info');
        
        const sendBtn = document.getElementById('send-otp-btn');
        sendBtn.disabled = true;

        try {
            const result = await customFetch('https://payment.ivacbd.com/api/get_otp', {
                method: 'POST',
                body: { email: email }
            });

            if (result.status_code === 200) {
                updateLoginStatus('✅ OTP sent successfully! Check your email/phone.', 'success');
                startOTPCountdown(120);
            } else {
                updateLoginStatus(`Failed to send OTP: ${result.message}`, 'error');
                sendBtn.disabled = false;
            }
        } catch (error) {
            updateLoginStatus(`Error: ${error.message}`, 'error');
            sendBtn.disabled = false;
        }
    }

    function loadLoginCaptcha() {
        const sitekey = document.getElementById('login-sitekey').value.trim();
        
        if (!sitekey) {
            updateLoginStatus('Please enter the Cloudflare sitekey', 'error');
            return;
        }

        updateLoginStatus('Loading captcha widget...', 'info');

        const container = document.getElementById('login-captcha-container');
        container.innerHTML = '';

        if (!window.turnstile) {
            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
            script.onload = () => renderLoginWidget(sitekey);
            script.onerror = () => {
                updateLoginStatus('Failed to load Turnstile script', 'error');
            };
            document.head.appendChild(script);
        } else {
            renderLoginWidget(sitekey);
        }
    }

    function renderLoginWidget(sitekey) {
        const container = document.getElementById('login-captcha-container');
        
        try {
            window.turnstile.render(container, {
                sitekey: sitekey,
                callback: function(token) {
                    document.getElementById('login-captcha-token').value = token;
                    updateLoginStatus('Captcha verified successfully!', 'success');
                    checkLoginReadiness();
                },
                'error-callback': function() {
                    updateLoginStatus('Captcha verification failed', 'error');
                    document.getElementById('login-captcha-token').value = '';
                }
            });
            updateLoginStatus('Captcha widget loaded. Please complete verification.', 'info');
        } catch (error) {
            updateLoginStatus('Error loading captcha: ' + error.message, 'error');
        }
    }

    function checkLoginReadiness() {
        const email = document.getElementById('login-email').value.trim();
        const otp = document.getElementById('login-otp').value.trim();
        const captchaToken = document.getElementById('login-captcha-token').value;

        const isReady = email && otp && captchaToken;
        
        const loginBtn = document.getElementById('login-btn');
        loginBtn.disabled = !isReady;
        loginBtn.style.background = isReady ? '#007bff' : '#6c757d';
    }

    async function performLogin() {
        const email = document.getElementById('login-email').value.trim();
        const otp = document.getElementById('login-otp').value.trim();
        const captchaToken = document.getElementById('login-captcha-token').value;

        if (!email || !otp || !captchaToken) {
            updateLoginStatus('Please complete all fields', 'error');
            return;
        }

        updateLoginStatus('Logging in...', 'info');

        const loginBtn = document.getElementById('login-btn');
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';

        try {
            const result = await customFetch('https://payment.ivacbd.com/api/login', {
                method: 'POST',
                body: {
                    email: email,
                    otp: otp,
                    'cf-turnstile-response': captchaToken
                }
            });

            if (result.status_code === 200) {
                loginState.accessToken = result.data.accessToken;
                loginState.refreshToken = result.data.refreshToken;
                loginState.userInfo = result.data.user;
                loginState.isLoggedIn = true;

                updateLoginStatus('✅ Login successful!', 'success');

                // Display token
                document.getElementById('login-access-token').value = result.data.accessToken;
                document.getElementById('login-token-display').style.display = 'block';

                // Auto-fill booking and payment tabs
                document.getElementById('booking-access-token').value = result.data.accessToken;
                document.getElementById('payment-access-token').value = result.data.accessToken;

                setTimeout(() => {
                    updateLoginStatus('✅ Token saved! You can now switch to App Booking tab.', 'success');
                }, 2000);
            } else {
                updateLoginStatus(`Login failed: ${result.message}`, 'error');
            }
        } catch (error) {
            updateLoginStatus(`Login error: ${error.message}`, 'error');
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    }

    function updateLoginStatus(message, type) {
        const statusDiv = document.getElementById('login-status');
        statusDiv.style.display = 'block';
        statusDiv.innerHTML = message;
        
        const colors = {
            success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
            error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
            info: { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460' }
        };
        
        const color = colors[type] || colors.info;
        statusDiv.style.background = color.bg;
        statusDiv.style.border = `1px solid ${color.border}`;
        statusDiv.style.color = color.text;
    }

    // BOOKING TAB FUNCTIONS
    async function loadApplicationInfo() {
        const accessToken = document.getElementById('booking-access-token').value.trim();

        if (!accessToken) {
            updateBookingStatus('Please enter access token', 'error');
            return;
        }

        updateBookingStatus('Loading application information...', 'info');

        const loadBtn = document.getElementById('load-app-info-btn');
        loadBtn.disabled = true;
        loadBtn.textContent = 'Loading...';

        try {
            const result = await customFetch('https://payment.ivacbd.com/api/get_applicant_info', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'language': 'en'
                }
            });

            if (result.status_code === 200) {
                bookingState.applicationInfo = result.data;
                updateBookingStatus('✅ Application info loaded!', 'success');

                // Sync webfile_id to personal info
                if (result.data.web_file_number) {
                    PERSONAL_INFO.webfile_id = result.data.web_file_number;
                }

                // Load visa centers
                await loadVisaCenters(accessToken);
            } else {
                updateBookingStatus(`Failed to load info: ${result.message}`, 'error');
            }
        } catch (error) {
            updateBookingStatus(`Error: ${error.message}`, 'error');
        } finally {
            loadBtn.disabled = false;
            loadBtn.textContent = 'Load Application Info';
        }
    }

    async function loadVisaCenters(accessToken) {
        try {
            updateBookingStatus('Loading visa centers...', 'info');

            const result = await customFetch('https://payment.ivacbd.com/api/get_visa_application_centres', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'language': 'en'
                }
            });

            if (result.status_code === 200 && result.data) {
                const centerSelect = document.getElementById('booking-center-select');
                centerSelect.innerHTML = '<option value="">Select a center...</option>';

                result.data.forEach(center => {
                    const option = document.createElement('option');
                    option.value = center.id;
                    option.textContent = `${center.center_name} (${center.address})`;
                    option.dataset.centerInfo = JSON.stringify(center);
                    centerSelect.appendChild(option);
                });

                document.getElementById('booking-center-section').style.display = 'block';
                updateBookingStatus('✅ Visa centers loaded. Please select one.', 'success');
            }
        } catch (error) {
            updateBookingStatus(`Error loading centers: ${error.message}`, 'error');
        }
    }

    async function handleCenterSelection() {
        const centerSelect = document.getElementById('booking-center-select');
        const selectedOption = centerSelect.options[centerSelect.selectedIndex];

        if (!selectedOption.value) return;

        bookingState.selectedCenter = JSON.parse(selectedOption.dataset.centerInfo);
        
        updateBookingStatus('Loading available dates...', 'info');

        const accessToken = document.getElementById('booking-access-token').value.trim();

        try {
            const result = await customFetch('https://payment.ivacbd.com/api/get_available_slots_for_appointment', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'language': 'en'
                },
                body: {
                    visa_application_centre_id: bookingState.selectedCenter.id
                }
            });

            if (result.status_code === 200 && result.data) {
                bookingState.availableDates = result.data;
                
                const dateSelect = document.getElementById('booking-date-select');
                dateSelect.innerHTML = '<option value="">Select a date...</option>';

                result.data.forEach(dateInfo => {
                    const option = document.createElement('option');
                    option.value = dateInfo.date;
                    option.textContent = `${dateInfo.date} (${dateInfo.slots.length} slots)`;
                    option.dataset.dateInfo = JSON.stringify(dateInfo);
                    dateSelect.appendChild(option);
                });

                dateSelect.disabled = false;
                document.getElementById('booking-date-section').style.display = 'block';
                updateBookingStatus('✅ Available dates loaded. Select a date.', 'success');
            }
        } catch (error) {
            updateBookingStatus(`Error loading dates: ${error.message}`, 'error');
        }
    }

    function handleDateSelection() {
        const dateSelect = document.getElementById('booking-date-select');
        const selectedOption = dateSelect.options[dateSelect.selectedIndex];

        if (!selectedOption.value) return;

        const dateInfo = JSON.parse(selectedOption.dataset.dateInfo);
        bookingState.selectedDate = dateInfo;

        const slotSelect = document.getElementById('booking-slot-select');
        slotSelect.innerHTML = '<option value="">Select a slot...</option>';

        dateInfo.slots.forEach(slot => {
            const option = document.createElement('option');
            option.value = slot.slot_id;
            option.textContent = `${slot.slot_time} (${slot.availableSlot} available)`;
            option.dataset.slotInfo = JSON.stringify(slot);
            slotSelect.appendChild(option);
        });

        slotSelect.disabled = false;
        document.getElementById('booking-slot-section').style.display = 'block';
        updateBookingStatus('✅ Slots loaded. Select a time slot.', 'success');
    }

    function handleSlotSelection() {
        const slotSelect = document.getElementById('booking-slot-select');
        const selectedOption = slotSelect.options[slotSelect.selectedIndex];

        if (!selectedOption.value) return;

        bookingState.selectedSlot = JSON.parse(selectedOption.dataset.slotInfo);
        
        document.getElementById('booking-captcha-section').style.display = 'block';
        updateBookingStatus('✅ Slot selected. Load captcha to continue.', 'success');
    }

    function loadBookingCaptcha() {
        const sitekey = document.getElementById('booking-sitekey').value.trim();

        if (!sitekey) {
            updateBookingStatus('Please enter the Cloudflare sitekey', 'error');
            return;
        }

        updateBookingStatus('Loading booking captcha...', 'info');

        const container = document.getElementById('booking-captcha-container');
        container.innerHTML = '';

        if (!window.turnstile) {
            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
            script.onload = () => renderBookingWidget(sitekey);
            document.head.appendChild(script);
        } else {
            renderBookingWidget(sitekey);
        }
    }

    function renderBookingWidget(sitekey) {
        const container = document.getElementById('booking-captcha-container');

        try {
            window.turnstile.render(container, {
                sitekey: sitekey,
                callback: function(token) {
                    document.getElementById('booking-captcha-token').value = token;
                    updateBookingStatus('Booking captcha verified!', 'success');
                    
                    const bookBtn = document.getElementById('book-appointment-btn');
                    bookBtn.disabled = false;
                    bookBtn.style.background = '#28a745';
                },
                'error-callback': function() {
                    updateBookingStatus('Booking captcha failed', 'error');
                    document.getElementById('booking-captcha-token').value = '';
                }
            });
            updateBookingStatus('Booking captcha loaded. Complete verification.', 'info');
        } catch (error) {
            updateBookingStatus('Error loading captcha: ' + error.message, 'error');
        }
    }

    async function bookAppointment() {
        const accessToken = document.getElementById('booking-access-token').value.trim();
        const captchaToken = document.getElementById('booking-captcha-token').value;

        if (!bookingState.selectedCenter || !bookingState.selectedSlot || !captchaToken) {
            updateBookingStatus('Please complete all selections', 'error');
            return;
        }

        updateBookingStatus('Booking appointment...', 'info');

        const bookBtn = document.getElementById('book-appointment-btn');
        bookBtn.disabled = true;
        bookBtn.textContent = 'Booking...';

        try {
            const result = await customFetch('https://payment.ivacbd.com/api/book_appointment', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'language': 'en'
                },
                body: {
                    slot_id: bookingState.selectedSlot.slot_id,
                    'cf-turnstile-response': captchaToken
                }
            });

            if (result.status_code === 200) {
                updateBookingStatus('🎉 Appointment booked successfully! You can now proceed to payment.', 'success');
                
                // Auto-fill payment tab
                document.getElementById('appointment-date').value = bookingState.selectedDate.date;
                
                setTimeout(() => {
                    updateBookingStatus('✅ Appointment confirmed! Switch to Payment tab to complete payment.', 'success');
                }, 2000);
            } else {
                updateBookingStatus(`Booking failed: ${result.message}`, 'error');
            }
        } catch (error) {
            updateBookingStatus(`Booking error: ${error.message}`, 'error');
        } finally {
            bookBtn.disabled = false;
            bookBtn.textContent = 'Book Appointment';
        }
    }

    function updateBookingStatus(message, type) {
        const statusDiv = document.getElementById('booking-status');
        statusDiv.style.display = 'block';
        statusDiv.innerHTML = message;

        const colors = {
            success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
            error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
            info: { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460' }
        };

        const color = colors[type] || colors.info;
        statusDiv.style.background = color.bg;
        statusDiv.style.border = `1px solid ${color.border}`;
        statusDiv.style.color = color.text;
    }

    // PAYMENT TAB FUNCTIONS
    async function fetchAppointmentSlots() {
        const accessToken = document.getElementById('payment-access-token').value.trim();
        const appointmentDate = document.getElementById('appointment-date').value.trim();

        if (!accessToken || !appointmentDate) {
            updatePaymentStatus('Please enter access token and date', 'error');
            return;
        }

        updatePaymentStatus('Fetching available slots...', 'info');

        const fetchBtn = document.getElementById('fetch-appointment-btn');
        fetchBtn.disabled = true;
        fetchBtn.textContent = 'Fetching...';

        try {
            const result = await customFetch('https://payment.ivacbd.com/api/get_payment_slots', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'language': 'en'
                },
                body: {
                    date: appointmentDate
                }
            });

            if (result.status_code === 200 && result.data && result.data.length > 0) {
                const timeSelect = document.getElementById('appointment-time');
                timeSelect.innerHTML = '<option value="">Select time...</option>';

                result.data.forEach(slot => {
                    const option = document.createElement('option');
                    option.value = slot.time;
                    option.textContent = `${slot.time} (${slot.available} available)`;
                    timeSelect.appendChild(option);
                });

                timeSelect.disabled = false;
                updatePaymentStatus('✅ Slots loaded. Select a time.', 'success');
            } else {
                // No slots available, set default
                setDefaultPaymentSlot();
            }
        } catch (error) {
            updatePaymentStatus(`Error: ${error.message}`, 'error');
            setDefaultPaymentSlot();
        } finally {
            fetchBtn.disabled = false;
            fetchBtn.textContent = 'Fetch Available Slots';
        }
    }

    function setDefaultPaymentSlot() {
        const timeSelect = document.getElementById('appointment-time');
        const defaultTime = '10:00 AM - 10:30 AM';

        timeSelect.innerHTML = '<option value="">Select time...</option>';
        
        const defaultOption = document.createElement('option');
        defaultOption.value = defaultTime;
        defaultOption.textContent = defaultTime;
        timeSelect.appendChild(defaultOption);

        timeSelect.value = defaultTime;
        timeSelect.disabled = false;

        updatePaymentStatus(`Default slot time set: ${defaultTime}`, 'info');
        checkPaymentReadiness();
    }

    function loadPaymentCaptcha() {
        const sitekey = document.getElementById('payment-sitekey').value.trim();

        if (!sitekey) {
            updatePaymentStatus('Please enter the Cloudflare sitekey', 'error');
            return;
        }

        updatePaymentStatus('Loading payment captcha...', 'info');

        const container = document.getElementById('payment-captcha-container');
        container.innerHTML = '';

        if (!window.turnstile) {
            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
            script.onload = () => renderPaymentWidget(sitekey);
            document.head.appendChild(script);
        } else {
            renderPaymentWidget(sitekey);
        }
    }

    function renderPaymentWidget(sitekey) {
        const container = document.getElementById('payment-captcha-container');

        try {
            window.turnstile.render(container, {
                sitekey: sitekey,
                callback: function(token) {
                    document.getElementById('payment-captcha-token').value = token;
                    updatePaymentStatus('Payment captcha verified!', 'success');
                    checkPaymentReadiness();
                },
                'error-callback': function() {
                    updatePaymentStatus('Payment captcha failed', 'error');
                    document.getElementById('payment-captcha-token').value = '';
                }
            });
            updatePaymentStatus('Payment captcha loaded. Complete verification.', 'info');
        } catch (error) {
            updatePaymentStatus('Error: ' + error.message, 'error');
        }
    }

    function checkPaymentReadiness() {
        const appointmentDate = document.getElementById('appointment-date').value;
        const appointmentTime = document.getElementById('appointment-time').value;
        const captchaToken = document.getElementById('payment-captcha-token').value;
        const accessToken = document.getElementById('payment-access-token').value;

        const isReady = appointmentDate && appointmentTime && captchaToken && accessToken;

        const payNowBtn = document.getElementById('pay-now-btn');
        payNowBtn.disabled = !isReady;
        payNowBtn.style.background = isReady ? '#dc3545' : '#6c757d';

        if (isReady) {
            updatePaymentStatus('Ready to submit payment!', 'success');
        }
    }

    async function submitPayment() {
        const accessToken = document.getElementById('payment-access-token').value.trim();
        const appointmentDate = document.getElementById('appointment-date').value;
        const appointmentTime = document.getElementById('appointment-time').value;
        const captchaToken = document.getElementById('payment-captcha-token').value;
        const captchaFieldName = document.getElementById('payment-captcha-field-name').value;
        const apiEndpoint = document.getElementById('payment-api-endpoint').value;

        const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
        const paymentMethod = {
            name: selectedPaymentMethod === 'visacard' ? 'VISA' : 'MASTER',
            slug: selectedPaymentMethod,
            link: selectedPaymentMethod === 'visacard'
                ? 'https://securepay.sslcommerz.com/gwprocess/v4/image/gw1/visa.png'
                : 'https://securepay.sslcommerz.com/gwprocess/v4/image/gw1/master.png'
        };

        if (!accessToken || !appointmentDate || !appointmentTime || !captchaToken) {
            updatePaymentStatus('Please complete all required fields', 'error');
            return;
        }

        updatePaymentStatus('Submitting payment request...', 'info');

        const payNowBtn = document.getElementById('pay-now-btn');
        payNowBtn.disabled = true;
        payNowBtn.textContent = 'Processing...';

        try {
            const payload = {
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                selected_payment: paymentMethod,
                [captchaFieldName]: captchaToken
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
                updatePaymentStatus('Payment request submitted successfully!', 'success');

                paymentData.paymentUrl = result.data.url;

                const paymentBtn = document.getElementById('payment-btn');
                paymentBtn.disabled = false;
                paymentBtn.style.display = 'block';
                paymentBtn.style.background = '#28a745';

                setTimeout(() => {
                    updatePaymentStatus(`
                        🎉 Payment URL received!<br>
                        Click "Open Payment Gateway" button below<br>
                        <strong>Payment URL:</strong> ${result.data.url}
                    `, 'success');
                }, 1000);

                const autoRedirect = confirm('Payment URL received! Redirect to payment gateway now?\n\nOK = Redirect immediately\nCancel = Use Payment button');

                if (autoRedirect) {
                    window.location.href = result.data.url;
                }
            } else {
                updatePaymentStatus(`Payment failed: ${result.message || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            updatePaymentStatus(`Network error: ${error.message}`, 'error');

            if (error.status === 401 || error.status === 419) {
                setTimeout(() => {
                    updatePaymentStatus('Session expired. Please login again.', 'error');
                }, 3000);
            }
        } finally {
            payNowBtn.disabled = false;
            payNowBtn.textContent = 'Pay Now';
        }
    }

    function openPaymentLink() {
        if (paymentData.paymentUrl) {
            window.open(paymentData.paymentUrl, '_blank');
            updatePaymentStatus('Payment gateway opened in new tab.', 'success');
        } else {
            updatePaymentStatus('No payment URL available. Submit payment first.', 'error');
        }
    }

    function updatePaymentStatus(message, type) {
        const statusDiv = document.getElementById('payment-status');
        statusDiv.style.display = 'block';
        statusDiv.innerHTML = message;

        const colors = {
            success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
            error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
            info: { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460' }
        };

        const color = colors[type] || colors.info;
        statusDiv.style.background = color.bg;
        statusDiv.style.border = `1px solid ${color.border}`;
        statusDiv.style.color = color.text;
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
                sendBtn.textContent = 'Send OTP';
                sendBtn.disabled = false;
                clearInterval(timer);
            }
        }, 1000);
    }

    // Initialize the script
    initScript();

})();
