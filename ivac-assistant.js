(function() {
    'use strict';

    // Prevent multiple instances
    if (window.ivacAssistantLoaded) {
        console.log('IVAC Assistant already loaded');
        return;
    }
    window.ivacAssistantLoaded = true;

    // Hardcoded personal info - MODIFY THESE VALUES AS NEEDED
    const PERSONAL_INFO = {
        full_name: 'NAJNEN SULTANA',
        email_name: 'najnensultana87@gmail.com',
        phone: '01889844184',
        webfile_id: 'BGDCV0F0A525', // This will be synced from application info

        // Family members - modify count and details as needed
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

    // Hardcoded Cloudflare sitekey - modify as needed
    const CLOUDFLARE_SITEKEYS = {
    login: '0x4AAAAAABpNUpzYeppBoYpe',
    booking: '0x4AAAAAABvQ3Mi6RktCuZ7P',
    payment: '0x4AAAAAABvQ3Mi6RktCuZ7P'
};

    // Wait for page to load completely
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScript);
    } else {
        initScript();
    }

    function initScript() {
        setTimeout(createMainPanel, 2000);
    }

    function createMainPanel() {
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

            <!-- Tab Navigation -->
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
                <!-- Login Tab -->
                <div id="login-tab" class="tab-content active">
                    ${createLoginTabContent()}
                </div>

                <!-- App Booking Tab -->
                <div id="booking-tab" class="tab-content" style="display: none;">
                    ${createBookingTabContent()}
                </div>

                <!-- Payment Tab -->
                <div id="payment-tab" class="tab-content" style="display: none;">
                    ${createPaymentTabContent()}
                </div>
            </div>

            <!-- Resize Handle -->
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

        makeDraggable(container);
        makeResizable(container);
        setupEventListeners();
        setupTabSwitching();
    }

    function createLoginTabContent() {
        return `
            <div style="display: flex; flex-direction: column; gap: 16px;">
                <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; border-left: 4px solid #007bff;">
                    <strong style="color: #007bff;">Personal Info (Hardcoded)</strong>
                    <div style="margin-top: 8px; font-size: 12px; color: #666;">
                        <div>📝 Name: ${PERSONAL_INFO.full_name}</div>
                        <div>📧 Email: ${PERSONAL_INFO.email_name}</div>
                        <div>📱 Phone: ${PERSONAL_INFO.phone}</div>
                    </div>
                </div>

                <!-- Login Captcha Section -->
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">
                        Cloudflare Sitekey
                    </label>
                    <div style="display: flex; gap: 8px;">
                        <input type="text" id="login-sitekey" 
                            value="${CLOUDFLARE_SITEKEYS.login}"
                            style="
                                flex: 1;
                                padding: 10px;
                                border: 1px solid #ced4da;
                                border-radius: 4px;
                                font-size: 12px;
                            "
                        />
                        <button id="load-login-captcha-btn" style="
                            padding: 10px 20px;
                            background: #007bff;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-weight: bold;
                            font-size: 12px;
                            white-space: nowrap;
                        ">Load</button>
                    </div>
                </div>

                <!-- Login Captcha Container -->
                <div id="login-captcha-container" style="
                    min-height: 65px;
                    border: 1px dashed #ced4da;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f8f9fa;
                    padding: 10px;
                ">
                    <p style="color: #666; margin: 0; font-size: 12px;">Click "Load" to load captcha</p>
                </div>

                <!-- Hidden Token -->
                <input type="hidden" id="login-captcha-token" />

                <!-- Login Button -->
                <button id="login-btn" disabled style="
                    width: 100%;
                    padding: 14px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: not-allowed;
                    font-weight: bold;
                    font-size: 14px;
                    transition: background 0.3s;
                ">Login to IVAC</button>

                <!-- Status Section -->
                <div id="login-status" style="
                    padding: 12px;
                    border-radius: 4px;
                    font-size: 12px;
                    background: #e7f3ff;
                    border: 1px solid #b3d9ff;
                    color: #004085;
                ">
                    Ready to login with your hardcoded personal info
                </div>
            </div>
        `;
    }

    function createBookingTabContent() {
        return `
            <div style="display: flex; flex-direction: column; gap: 16px;">
                <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; border-left: 4px solid #28a745;">
                    <strong style="color: #28a745;">Booking Configuration</strong>
                    <div style="margin-top: 8px; font-size: 12px; color: #666;">
                        Configure appointment booking settings
                    </div>
                </div>

                <!-- Access Token -->
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">
                        Access Token
                    </label>
                    <div style="display: flex; gap: 8px;">
                        <input type="text" id="booking-access-token" 
                            placeholder="Paste your access token here"
                            style="
                                flex: 1;
                                padding: 10px;
                                border: 1px solid #ced4da;
                                border-radius: 4px;
                                font-size: 12px;
                            "
                        />
                        <button id="load-booking-data-btn" style="
                            padding: 10px 20px;
                            background: #007bff;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-weight: bold;
                            font-size: 12px;
                            white-space: nowrap;
                        ">Load Data</button>
                    </div>
                </div>

                <!-- Application Info -->
                <div id="booking-application-info" style="
                    background: #fff3cd;
                    border: 1px solid #ffc107;
                    border-radius: 4px;
                    padding: 12px;
                    font-size: 12px;
                    display: none;
                ">
                    <strong>Application Info:</strong>
                    <div id="booking-app-details" style="margin-top: 8px;"></div>
                </div>

                <!-- Booking Configuration -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div>
                        <label style="display: block; margin-bottom: 4px; font-size: 12px; font-weight: bold;">Center</label>
                        <select id="booking-center" style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #ced4da;
                            border-radius: 4px;
                            font-size: 12px;
                        ">
                            <option value="">Select Center</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 4px; font-size: 12px; font-weight: bold;">Visa Type</label>
                        <select id="booking-visa-type" style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #ced4da;
                            border-radius: 4px;
                            font-size: 12px;
                        ">
                            <option value="">Select Visa Type</option>
                        </select>
                    </div>
                </div>

                <!-- Date Slots -->
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">
                        Available Date Slots
                    </label>
                    <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                        <button id="fetch-slots-btn" disabled style="
                            flex: 1;
                            padding: 10px;
                            background: #6c757d;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: not-allowed;
                            font-weight: bold;
                            font-size: 12px;
                        ">Fetch Slots</button>
                        <button id="auto-select-first-btn" disabled style="
                            flex: 1;
                            padding: 10px;
                            background: #6c757d;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: not-allowed;
                            font-weight: bold;
                            font-size: 12px;
                        ">Auto First</button>
                    </div>
                    <select id="booking-date-slot" size="5" disabled style="
                        width: 100%;
                        padding: 8px;
                        border: 1px solid #ced4da;
                        border-radius: 4px;
                        font-size: 12px;
                    ">
                        <option value="">No slots available</option>
                    </select>
                </div>

                <!-- Time Slots -->
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">
                        Available Time Slots
                    </label>
                    <select id="booking-time-slot" size="5" disabled style="
                        width: 100%;
                        padding: 8px;
                        border: 1px solid #ced4da;
                        border-radius: 4px;
                        font-size: 12px;
                    ">
                        <option value="">Select a date first</option>
                    </select>
                </div>

                <!-- Booking Captcha Section -->
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">
                        Booking Captcha
                    </label>
                    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                        <input type="text" id="booking-sitekey" 
                            value="${CLOUDFLARE_SITEKEYS.booking}"
                            style="
                                flex: 1;
                                padding: 10px;
                                border: 1px solid #ced4da;
                                border-radius: 4px;
                                font-size: 12px;
                            "
                        />
                        <button id="load-booking-captcha-btn" disabled style="
                            padding: 10px 20px;
                            background: #6c757d;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: not-allowed;
                            font-weight: bold;
                            font-size: 12px;
                            white-space: nowrap;
                        ">Load</button>
                    </div>
                    <div id="booking-captcha-container" style="
                        min-height: 65px;
                        border: 1px dashed #ced4da;
                        border-radius: 4px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #f8f9fa;
                        padding: 10px;
                    ">
                        <p style="color: #666; margin: 0; font-size: 12px;">Select date & time first</p>
                    </div>
                    <input type="hidden" id="booking-captcha-token" />
                </div>

                <!-- Booking Button -->
                <button id="book-appointment-btn" disabled style="
                    width: 100%;
                    padding: 14px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: not-allowed;
                    font-weight: bold;
                    font-size: 14px;
                    transition: background 0.3s;
                ">Book Appointment</button>

                <!-- Status Section -->
                <div id="booking-status" style="
                    padding: 12px;
                    border-radius: 4px;
                    font-size: 12px;
                    background: #e7f3ff;
                    border: 1px solid #b3d9ff;
                    color: #004085;
                ">
                    Enter access token and load data to begin
                </div>
            </div>
        `;
    }

    function createPaymentTabContent() {
        return `
            <div style="display: flex; flex-direction: column; gap: 16px;">
                <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; border-left: 4px solid #dc3545;">
                    <strong style="color: #dc3545;">Payment Configuration</strong>
                    <div style="margin-top: 8px; font-size: 12px; color: #666;">
                        Complete payment for your appointment
                    </div>
                </div>

                <!-- Access Token -->
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">
                        Access Token
                    </label>
                    <input type="text" id="payment-access-token" 
                        placeholder="Paste your access token here"
                        style="
                            width: 100%;
                            padding: 10px;
                            border: 1px solid #ced4da;
                            border-radius: 4px;
                            font-size: 12px;
                        "
                    />
                </div>

                <!-- API Configuration -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div>
                        <label style="display: block; margin-bottom: 4px; font-size: 12px; font-weight: bold;">API Endpoint</label>
                        <input type="text" id="payment-api-endpoint" 
                            value="https://payment.ivacbd.com/api/v1/queue-manage"
                            style="
                                width: 100%;
                                padding: 8px;
                                border: 1px solid #ced4da;
                                border-radius: 4px;
                                font-size: 11px;
                            "
                        />
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 4px; font-size: 12px; font-weight: bold;">Captcha Field Name</label>
                        <input type="text" id="payment-captcha-field-name" 
                            value="cf-turnstile-response"
                            style="
                                width: 100%;
                                padding: 8px;
                                border: 1px solid #ced4da;
                                border-radius: 4px;
                                font-size: 11px;
                            "
                        />
                    </div>
                </div>

                <!-- Appointment Selection -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div>
                        <label style="display: block; margin-bottom: 4px; font-size: 12px; font-weight: bold;">Appointment Date</label>
                        <select id="appointment-date" style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #ced4da;
                            border-radius: 4px;
                            font-size: 12px;
                        ">
                            <option value="">Select date</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 4px; font-size: 12px; font-weight: bold;">Appointment Time</label>
                        <select id="appointment-time" disabled style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #ced4da;
                            border-radius: 4px;
                            font-size: 12px;
                        ">
                            <option value="">Select date first</option>
                        </select>
                    </div>
                </div>

                <!-- Populate Slots Button -->
                <button id="populate-slots-btn" style="
                    width: 100%;
                    padding: 10px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 12px;
                ">Populate Date/Time Slots</button>

                <!-- Payment Method Selection -->
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">
                        Payment Method
                    </label>
                    <div style="display: flex; gap: 16px;">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="radio" name="payment-method" value="visacard" checked style="cursor: pointer;" />
                            <span style="font-size: 12px;">VISA Card</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="radio" name="payment-method" value="master" style="cursor: pointer;" />
                            <span style="font-size: 12px;">Master Card</span>
                        </label>
                    </div>
                </div>

                <!-- Payment Captcha Section -->
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">
                        Payment Captcha
                    </label>
                    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                        <input type="text" id="payment-sitekey" 
                            value="${CLOUDFLARE_SITEKEYS.payment}"
                            style="
                                flex: 1;
                                padding: 10px;
                                border: 1px solid #ced4da;
                                border-radius: 4px;
                                font-size: 12px;
                            "
                        />
                        <button id="load-payment-captcha-btn" style="
                            padding: 10px 20px;
                            background: #007bff;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-weight: bold;
                            font-size: 12px;
                            white-space: nowrap;
                        ">Load</button>
                    </div>
                    <div id="payment-captcha-container" style="
                        min-height: 65px;
                        border: 1px dashed #ced4da;
                        border-radius: 4px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #f8f9fa;
                        padding: 10px;
                    ">
                        <p style="color: #666; margin: 0; font-size: 12px;">Click "Load" to load captcha</p>
                    </div>
                    <input type="hidden" id="payment-captcha-token" />
                </div>

                <!-- Payment Buttons -->
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px;">
                    <button id="pay-now-btn" disabled style="
                        padding: 14px;
                        background: #6c757d;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: not-allowed;
                        font-weight: bold;
                        font-size: 14px;
                    ">Pay Now</button>
                    <button id="payment-btn" disabled style="
                        padding: 14px;
                        background: #6c757d;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: not-allowed;
                        font-weight: bold;
                        font-size: 14px;
                    ">Payment</button>
                </div>

                <!-- Status Section -->
                <div id="payment-status" style="
                    padding: 12px;
                    border-radius: 4px;
                    font-size: 12px;
                    background: #e7f3ff;
                    border: 1px solid #b3d9ff;
                    color: #004085;
                ">
                    Complete all fields to proceed with payment
                </div>
            </div>
        `;
    }

    function makeDraggable(element) {
        const header = element.querySelector('#panel-header');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        function dragStart(e) {
            if (e.target.id === 'close-panel' || e.target.id === 'minimize-panel') return;

            initialX = e.clientX - element.offsetLeft;
            initialY = e.clientY - element.offsetTop;
            isDragging = true;
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;

                element.style.left = currentX + 'px';
                element.style.top = currentY + 'px';
                element.style.right = 'auto';
            }
        }

        function dragEnd() {
            isDragging = false;
        }
    }

    function makeResizable(element) {
        const handle = element.querySelector('#resize-handle');
        let isResizing = false;
        let startX, startY, startWidth, startHeight;

        handle.addEventListener('mousedown', startResize);
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);

        function startResize(e) {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(window.getComputedStyle(element).width, 10);
            startHeight = parseInt(window.getComputedStyle(element).height, 10);
            e.preventDefault();
        }

        function resize(e) {
            if (!isResizing) return;

            const width = startWidth + (e.clientX - startX);
            const height = startHeight + (e.clientY - startY);

            if (width > 300) element.style.width = width + 'px';
            if (height > 400) element.style.maxHeight = height + 'px';
        }

        function stopResize() {
            isResizing = false;
        }
    }

    function setupEventListeners() {
        // Close and minimize handlers
        document.getElementById('close-panel').addEventListener('click', () => {
            document.getElementById('ivac-assistant-main').remove();
            window.ivacAssistantLoaded = false;
        });

        document.getElementById('minimize-panel').addEventListener('click', () => {
            const content = document.getElementById('panel-content');
            const tabs = document.getElementById('tab-navigation');
            const isMinimized = content.style.display === 'none';

            content.style.display = isMinimized ? 'block' : 'none';
            tabs.style.display = isMinimized ? 'flex' : 'none';
            document.getElementById('minimize-panel').textContent = isMinimized ? '−' : '+';
        });

        // Login tab handlers
        document.getElementById('load-login-captcha-btn').addEventListener('click', loadLoginCaptcha);
        document.getElementById('login-btn').addEventListener('click', performLogin);

        // Booking tab handlers
        document.getElementById('load-booking-data-btn').addEventListener('click', loadBookingData);
        document.getElementById('fetch-slots-btn').addEventListener('click', fetchAvailableSlots);
        document.getElementById('auto-select-first-btn').addEventListener('click', autoSelectFirstSlot);
        document.getElementById('booking-date-slot').addEventListener('change', onDateSlotChange);
        document.getElementById('load-booking-captcha-btn').addEventListener('click', loadBookingCaptcha);
        document.getElementById('book-appointment-btn').addEventListener('click', bookAppointment);

        // Payment tab handlers
        document.getElementById('populate-slots-btn').addEventListener('click', populateDateTimeSlots);
        document.getElementById('appointment-date').addEventListener('change', onPaymentDateChange);
        document.getElementById('load-payment-captcha-btn').addEventListener('click', loadPaymentCaptcha);
        document.getElementById('pay-now-btn').addEventListener('click', submitPayment);
        document.getElementById('payment-btn').addEventListener('click', openPaymentLink);
    }

    function setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');

                // Update button styles
                tabButtons.forEach(btn => {
                    btn.style.background = '#f8f9fa';
                    btn.style.color = '#333';
                    btn.classList.remove('active');
                });
                button.style.background = '#007bff';
                button.style.color = 'white';
                button.classList.add('active');

                // Show/hide tab content
                tabContents.forEach(content => {
                    content.style.display = 'none';
                });
                document.getElementById(`${targetTab}-tab`).style.display = 'block';
            });
        });
    }

    // ============================================================
    // LOGIN TAB FUNCTIONS
    // ============================================================

    let loginData = {
        captchaToken: null
    };

    function loadLoginCaptcha() {
        const sitekey = document.getElementById('login-sitekey').value.trim();

        if (!sitekey) {
            updateLoginStatus('Please enter the Cloudflare sitekey', 'error');
            return;
        }

        updateLoginStatus('Loading login captcha widget...', 'info');

        const container = document.getElementById('login-captcha-container');
        container.innerHTML = '';

        if (!window.turnstile) {
            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
            script.onload = () => renderLoginWidget(sitekey);
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
                    loginData.captchaToken = token;
                    document.getElementById('login-captcha-token').value = token;
                    updateLoginStatus('Captcha verified successfully! You can now login.', 'success');

                    const loginBtn = document.getElementById('login-btn');
                    loginBtn.disabled = false;
                    loginBtn.style.background = '#28a745';
                    loginBtn.style.cursor = 'pointer';
                },
                'error-callback': function() {
                    updateLoginStatus('Captcha verification failed. Please try again.', 'error');
                    loginData.captchaToken = null;
                    document.getElementById('login-captcha-token').value = '';
                }
            });
            updateLoginStatus('Captcha widget loaded. Please complete the verification.', 'info');
        } catch (error) {
            updateLoginStatus('Error loading captcha widget: ' + error.message, 'error');
        }
    }

    async function performLogin() {
        const captchaToken = loginData.captchaToken || document.getElementById('login-captcha-token').value;

        if (!captchaToken) {
            updateLoginStatus('Please complete the captcha verification first', 'error');
            return;
        }

        updateLoginStatus('Logging in with your hardcoded credentials...', 'info');

        const loginBtn = document.getElementById('login-btn');
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';

        try {
            const payload = {
                email: PERSONAL_INFO.email_name,
                'cf-turnstile-response': captchaToken
            };

            const result = await customFetch('https://payment.ivacbd.com/api/v1/login', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'language': 'en'
                },
                body: payload
            });

            if (result.status_code === 200) {
                updateLoginStatus(`✅ Login successful! Welcome ${PERSONAL_INFO.full_name}`, 'success');

                // Show token info
                setTimeout(() => {
                    updateLoginStatus(`
                        🎉 Login successful!<br>
                        <strong>Access Token:</strong> ${result.data.token}<br>
                        <strong>Copy this token</strong> and paste it into the Booking or Payment tab to continue.
                    `, 'success');
                }, 1000);

            } else {
                updateLoginStatus(`Login failed: ${result.message || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            updateLoginStatus(`Network error: ${error.message}`, 'error');
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login to IVAC';
        }
    }

    function updateLoginStatus(message, type = 'info') {
        const statusDiv = document.getElementById('login-status');
        const colors = {
            info: { bg: '#e7f3ff', border: '#b3d9ff', text: '#004085' },
            success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
            error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' }
        };

        const color = colors[type] || colors.info;
        statusDiv.style.background = color.bg;
        statusDiv.style.borderColor = color.border;
        statusDiv.style.color = color.text;
        statusDiv.innerHTML = message;
    }

    // ============================================================
    // BOOKING TAB FUNCTIONS
    // ============================================================

    let bookingData = {
        accessToken: null,
        applicationInfo: null,
        centers: [],
        visaTypes: [],
        slots: [],
        selectedDate: null,
        selectedTime: null,
        captchaToken: null
    };

    async function loadBookingData() {
        const accessToken = document.getElementById('booking-access-token').value.trim();

        if (!accessToken) {
            updateBookingStatus('Please enter your access token', 'error');
            return;
        }

        bookingData.accessToken = accessToken;
        updateBookingStatus('Loading application data...', 'info');

        try {
            // Fetch application info
            const appInfo = await customFetch('https://payment.ivacbd.com/api/v1/application_info', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'language': 'en',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (appInfo.status_code === 200) {
                bookingData.applicationInfo = appInfo.data;
                displayApplicationInfo(appInfo.data);

                // Sync webfile_id
                PERSONAL_INFO.webfile_id = appInfo.data.webfile_number;

                // Fetch centers and visa types
                await loadCentersAndVisaTypes(accessToken);

                updateBookingStatus('Application data loaded successfully!', 'success');
            } else {
                updateBookingStatus(`Failed to load data: ${appInfo.message}`, 'error');
            }
        } catch (error) {
            updateBookingStatus(`Network error: ${error.message}`, 'error');

            if (error.status === 401 || error.status === 419) {
                setTimeout(() => {
                    updateBookingStatus('Session expired. Please login again.', 'error');
                }, 3000);
            }
        }
    }

    function displayApplicationInfo(data) {
        const infoDiv = document.getElementById('booking-application-info');
        const detailsDiv = document.getElementById('booking-app-details');

        detailsDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div><strong>Name:</strong> ${data.name}</div>
                <div><strong>Web File:</strong> ${data.webfile_number}</div>
                <div><strong>Email:</strong> ${data.email}</div>
                <div><strong>Phone:</strong> ${data.phone}</div>
                <div><strong>Applicants:</strong> ${data.applicant_count}</div>
                <div><strong>Amount:</strong> $${data.amount}</div>
            </div>
        `;

        infoDiv.style.display = 'block';
    }

    async function loadCentersAndVisaTypes(accessToken) {
        try {
            // Fetch centers
            const centersResult = await customFetch('https://payment.ivacbd.com/api/v1/get_center_list', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'language': 'en',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (centersResult.status_code === 200) {
                bookingData.centers = centersResult.data;
                populateCenterDropdown(centersResult.data);
            }

            // Fetch visa types
            const visaTypesResult = await customFetch('https://payment.ivacbd.com/api/v1/get_visa_type_list', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'language': 'en',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (visaTypesResult.status_code === 200) {
                bookingData.visaTypes = visaTypesResult.data;
                populateVisaTypeDropdown(visaTypesResult.data);
            }
        } catch (error) {
            console.error('Error loading centers/visa types:', error);
        }
    }

    function populateCenterDropdown(centers) {
        const select = document.getElementById('booking-center');
        select.innerHTML = '<option value="">Select Center</option>';

        centers.forEach(center => {
            const option = document.createElement('option');
            option.value = center.c_id;
            option.textContent = center.c_name;
            select.appendChild(option);
        });

        select.addEventListener('change', enableFetchSlots);
    }

    function populateVisaTypeDropdown(visaTypes) {
        const select = document.getElementById('booking-visa-type');
        select.innerHTML = '<option value="">Select Visa Type</option>';

        visaTypes.forEach(visaType => {
            const option = document.createElement('option');
            option.value = visaType.v_id;
            option.textContent = visaType.v_name;
            select.appendChild(option);
        });

        select.addEventListener('change', enableFetchSlots);
    }

    function enableFetchSlots() {
        const center = document.getElementById('booking-center').value;
        const visaType = document.getElementById('booking-visa-type').value;

        const fetchBtn = document.getElementById('fetch-slots-btn');
        const autoBtn = document.getElementById('auto-select-first-btn');

        if (center && visaType) {
            fetchBtn.disabled = false;
            fetchBtn.style.background = '#28a745';
            fetchBtn.style.cursor = 'pointer';

            autoBtn.disabled = false;
            autoBtn.style.background = '#ffc107';
            autoBtn.style.cursor = 'pointer';
        }
    }

    async function fetchAvailableSlots() {
        const center = document.getElementById('booking-center').value;
        const visaType = document.getElementById('booking-visa-type').value;

        if (!center || !visaType) {
            updateBookingStatus('Please select both center and visa type', 'error');
            return;
        }

        updateBookingStatus('Fetching available slots...', 'info');

        try {
            const result = await customFetch('https://payment.ivacbd.com/api/v1/get_available_slots', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'language': 'en',
                    'Authorization': `Bearer ${bookingData.accessToken}`
                },
                body: {
                    center_id: center,
                    visa_type_id: visaType
                }
            });

            if (result.status_code === 200 && result.data && result.data.length > 0) {
                bookingData.slots = result.data;
                populateDateSlots(result.data);
                updateBookingStatus(`Found ${result.data.length} available slots!`, 'success');
            } else {
                updateBookingStatus('No available slots found', 'error');
                bookingData.slots = [];
            }
        } catch (error) {
            updateBookingStatus(`Error fetching slots: ${error.message}`, 'error');
        }
    }

    function populateDateSlots(slots) {
        const select = document.getElementById('booking-date-slot');
        select.innerHTML = '';
        select.disabled = false;

        slots.forEach((slot, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${slot.date} (${slot.available_slots} slots available)`;
            select.appendChild(option);
        });
    }

    function onDateSlotChange() {
        const select = document.getElementById('booking-date-slot');
        const selectedIndex = select.value;

        if (selectedIndex === '') return;

        const slot = bookingData.slots[selectedIndex];
        bookingData.selectedDate = slot.date;

        populateTimeSlots(slot.slots);
    }

    function populateTimeSlots(timeSlots) {
        const select = document.getElementById('booking-time-slot');
        select.innerHTML = '';
        select.disabled = false;

        timeSlots.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            select.appendChild(option);
        });

        select.addEventListener('change', () => {
            bookingData.selectedTime = select.value;
            enableBookingCaptcha();
        });
    }

    function enableBookingCaptcha() {
        if (bookingData.selectedDate && bookingData.selectedTime) {
            const loadBtn = document.getElementById('load-booking-captcha-btn');
            loadBtn.disabled = false;
            loadBtn.style.background = '#007bff';
            loadBtn.style.cursor = 'pointer';

            updateBookingStatus('Date and time selected. Load captcha to continue.', 'info');
        }
    }

    async function autoSelectFirstSlot() {
        await fetchAvailableSlots();

        if (bookingData.slots.length > 0) {
            const dateSelect = document.getElementById('booking-date-slot');
            dateSelect.selectedIndex = 0;
            onDateSlotChange();

            setTimeout(() => {
                const timeSelect = document.getElementById('booking-time-slot');
                if (timeSelect.options.length > 0) {
                    timeSelect.selectedIndex = 0;
                    bookingData.selectedTime = timeSelect.value;
                    enableBookingCaptcha();
                    updateBookingStatus('First available slot selected automatically!', 'success');
                }
            }, 500);
        }
    }

    function loadBookingCaptcha() {
        const sitekey = document.getElementById('booking-sitekey').value.trim();

        if (!sitekey) {
            updateBookingStatus('Please enter the Cloudflare sitekey', 'error');
            return;
        }

        updateBookingStatus('Loading booking captcha widget...', 'info');

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
                    bookingData.captchaToken = token;
                    document.getElementById('booking-captcha-token').value = token;
                    updateBookingStatus('Captcha verified! Ready to book appointment.', 'success');

                    const bookBtn = document.getElementById('book-appointment-btn');
                    bookBtn.disabled = false;
                    bookBtn.style.background = '#28a745';
                    bookBtn.style.cursor = 'pointer';
                },
                'error-callback': function() {
                    updateBookingStatus('Captcha verification failed', 'error');
                    bookingData.captchaToken = null;
                    document.getElementById('booking-captcha-token').value = '';
                }
            });
            updateBookingStatus('Captcha widget loaded. Please complete verification.', 'info');
        } catch (error) {
            updateBookingStatus('Error loading captcha widget: ' + error.message, 'error');
        }
    }

    async function bookAppointment() {
        const captchaToken = bookingData.captchaToken || document.getElementById('booking-captcha-token').value;

        if (!captchaToken) {
            updateBookingStatus('Please complete captcha verification', 'error');
            return;
        }

        if (!bookingData.selectedDate || !bookingData.selectedTime) {
            updateBookingStatus('Please select date and time', 'error');
            return;
        }

        updateBookingStatus('Booking your appointment...', 'info');

        const bookBtn = document.getElementById('book-appointment-btn');
        bookBtn.disabled = true;
        bookBtn.textContent = 'Booking...';

        try {
            const payload = {
                center_id: document.getElementById('booking-center').value,
                visa_type_id: document.getElementById('booking-visa-type').value,
                appointment_date: bookingData.selectedDate,
                appointment_time: bookingData.selectedTime,
                'cf-turnstile-response': captchaToken
            };

            const result = await customFetch('https://payment.ivacbd.com/api/v1/book_appointment', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'language': 'en',
                    'Authorization': `Bearer ${bookingData.accessToken}`
                },
                body: payload
            });

            if (result.status_code === 200) {
                updateBookingStatus(`
                    🎉 Appointment booked successfully!<br>
                    <strong>Date:</strong> ${bookingData.selectedDate}<br>
                    <strong>Time:</strong> ${bookingData.selectedTime}<br>
                    Now proceed to Payment tab to complete payment.
                `, 'success');
            } else {
                updateBookingStatus(`Booking failed: ${result.message || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            updateBookingStatus(`Network error: ${error.message}`, 'error');

            if (error.status === 401 || error.status === 419) {
                setTimeout(() => {
                    updateBookingStatus('Session expired. Please login again.', 'error');
                }, 3000);
            }
        } finally {
            bookBtn.disabled = false;
            bookBtn.textContent = 'Book Appointment';
        }
    }

    function updateBookingStatus(message, type = 'info') {
        const statusDiv = document.getElementById('booking-status');
        const colors = {
            info: { bg: '#e7f3ff', border: '#b3d9ff', text: '#004085' },
            success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
            error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' }
        };

        const color = colors[type] || colors.info;
        statusDiv.style.background = color.bg;
        statusDiv.style.borderColor = color.border;
        statusDiv.style.color = color.text;
        statusDiv.innerHTML = message;
    }

    // ============================================================
    // PAYMENT TAB FUNCTIONS
    // ============================================================

    let paymentData = {
        paymentUrl: null
    };

    async function populateDateTimeSlots() {
        const accessToken = document.getElementById('payment-access-token').value.trim();

        if (!accessToken) {
            updatePaymentStatus('Please enter your access token', 'error');
            return;
        }

        updatePaymentStatus('Fetching date and time slots...', 'info');

        try {
            // Use the queued info endpoint to get booked appointment details
            const result = await customFetch('https://payment.ivacbd.com/api/v1/queue_info', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'language': 'en',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (result.status_code === 200 && result.data) {
                const data = result.data;

                // Populate appointment date
                const dateSelect = document.getElementById('appointment-date');
                dateSelect.innerHTML = '';
                const dateOption = document.createElement('option');
                dateOption.value = data.slot_date;
                dateOption.textContent = data.slot_date;
                dateSelect.appendChild(dateOption);
                dateSelect.value = data.slot_date;

                // Populate appointment time
                const timeSelect = document.getElementById('appointment-time');
                timeSelect.innerHTML = '';
                const timeOption = document.createElement('option');
                timeOption.value = data.slot_time;
                timeOption.textContent = data.slot_time;
                timeSelect.appendChild(timeOption);
                timeSelect.value = data.slot_time;
                timeSelect.disabled = false;

                updatePaymentStatus(`Appointment details loaded: ${data.slot_date} at ${data.slot_time}`, 'success');
                checkPaymentReadiness();
            } else {
                // If no queued appointment, try to set default
                setDefaultSlotTime();
            }
        } catch (error) {
            updatePaymentStatus(`Error fetching slots: ${error.message}`, 'error');
            // Fallback to default time
            setDefaultSlotTime();
        }
    }

    function onPaymentDateChange() {
        const date = document.getElementById('appointment-date').value;
        const timeSelect = document.getElementById('appointment-time');

        if (date) {
            // In a real scenario, you'd fetch times for this date
            // For now, we'll just enable the time select
            timeSelect.disabled = false;
            checkPaymentReadiness();
        }
    }

    function setDefaultSlotTime() {
        const dateSelect = document.getElementById('appointment-date');
        const timeSelect = document.getElementById('appointment-time');

        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const defaultDate = today.toISOString().split('T')[0];
        const defaultTime = '09:00';

        // Populate default date
        dateSelect.innerHTML = '';
        let defaultDateOption = document.createElement('option');
        defaultDateOption.value = defaultDate;
        defaultDateOption.textContent = defaultDate + ' (Default)';
        dateSelect.appendChild(defaultDateOption);
        dateSelect.value = defaultDate;

        // Populate default time
        timeSelect.innerHTML = '';
        let defaultOption = dateSelect.querySelector(`option[value="${defaultTime}"]`);
        if (!defaultOption) {
            defaultOption = document.createElement('option');
            defaultOption.value = defaultTime;
            defaultOption.textContent = defaultTime;
            timeSelect.appendChild(defaultOption);
        }

        timeSelect.value = defaultTime;
        timeSelect.disabled = false;

        updatePaymentStatus(`Default slot time set: ${defaultTime}`, 'info');

        // Enable pay now button
        checkPaymentReadiness();
    }

    function loadPaymentCaptcha() {
        const sitekey = document.getElementById('payment-sitekey').value.trim();

        if (!sitekey) {
            updatePaymentStatus('Please enter the Cloudflare sitekey', 'error');
            return;
        }

        updatePaymentStatus('Loading payment captcha widget...', 'info');

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
                    updatePaymentStatus('Payment captcha verified successfully!', 'success');
                    checkPaymentReadiness();
                },
                'error-callback': function() {
                    updatePaymentStatus('Payment captcha verification failed', 'error');
                    document.getElementById('payment-captcha-token').value = '';
                }
            });
            updatePaymentStatus('Payment captcha widget loaded. Please complete verification.', 'info');
        } catch (error) {
            updatePaymentStatus('Error loading payment captcha widget: ' + error.message, 'error');
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

        // Get selected payment method
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
            // Payload structure matches the site script exactly
            const payload = {
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                selected_payment: paymentMethod,
                [captchaFieldName]: captchaToken
            };

            console.log('Payment payload:', payload); // Debug log

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
                updatePaymentStatus('Payment request submitted successfully! Payment URL received.', 'success');

                // Store payment URL
                paymentData.paymentUrl = result.data.url;

                // Enable payment button
                const paymentBtn = document.getElementById('payment-btn');
                paymentBtn.disabled = false;
                paymentBtn.style.background = '#28a745';

                // Show success message with options
                setTimeout(() => {
                    updatePaymentStatus(`
                        🎉 Payment URL received successfully!<br>
                        <strong>Options:</strong><br>
                        • Click "Payment" button to open in new tab<br>
                        • Or we can redirect directly to payment (like original site)<br>
                        <strong>Payment URL:</strong> ${result.data.url}
                    `, 'success');
                }, 1000);

                // Optional: Ask user if they want to redirect immediately
                const autoRedirect = confirm('Payment URL received! Do you want to redirect to payment gateway now?\n\nClick OK to redirect immediately, or Cancel to use the Payment button.');

                if (autoRedirect) {
                    // Clear localStorage and redirect like original site
                    // localStorage.clear(); // Uncomment if you want to clear all localStorage
                    window.location.href = result.data.url;
                }

            } else {
                updatePaymentStatus(`Payment submission failed: ${result.message || 'Unknown error'}`, 'error');
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
            updatePaymentStatus('Payment gateway opened in new tab. Complete your payment there.', 'success');
        } else {
            updatePaymentStatus('No payment URL available. Please submit payment first.', 'error');
        }
    }

    function updatePaymentStatus(message, type = 'info') {
        const statusDiv = document.getElementById('payment-status');
        const colors = {
            info: { bg: '#e7f3ff', border: '#b3d9ff', text: '#004085' },
            success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
            error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' }
        };

        const color = colors[type] || colors.info;
        statusDiv.style.background = color.bg;
        statusDiv.style.borderColor = color.border;
        statusDiv.style.color = color.text;
        statusDiv.innerHTML = message;
    }

    // ============================================================
    // UTILITY FUNCTIONS
    // ============================================================

    async function customFetch(url, options = {}) {
        const defaultHeaders = {
            'Content-Type': 'application/json'
        };

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: data.message || 'Request failed',
                    data: data
                };
            }

            return data;
        } catch (error) {
            if (error.status) {
                throw error;
            }
            throw {
                status: 0,
                message: error.message || 'Network error occurred'
            };
        }
    }

})();
