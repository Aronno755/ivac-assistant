/**
 * IVAC Complete Assistant v6.0 - Enhanced Autofill Edition
 * Complete IVAC automation with smart autofill for disabled fields
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
    const PERSONAL_INFO = {
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

    // Payment data storage
    let paymentData = {
        slotDates: {},
        slotTimes: [],
        paymentUrl: '',
        selectedPaymentMethod: 'visacard'
    };

    // ==========================================
    // ENHANCED AUTOFILL FUNCTIONS
    // ==========================================

    /**
     * Smart field filler that bypasses copy-paste restrictions
     */
    function smartFillField(element, value) {
        if (!element) return false;

        try {
            // Method 1: Direct value assignment
            element.value = value;

            // Method 2: Trigger native setter
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                'value'
            ).set;
            nativeInputValueSetter.call(element, value);

            // Method 3: Trigger native textarea setter if it's a textarea
            if (element.tagName === 'TEXTAREA') {
                const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLTextAreaElement.prototype,
                    'value'
                ).set;
                nativeTextAreaValueSetter.call(element, value);
            }

            // Remove readonly/disabled temporarily
            const wasReadOnly = element.readOnly;
            const wasDisabled = element.disabled;
            element.readOnly = false;
            element.disabled = false;

            // Simulate user input events
            const events = [
                new Event('input', { bubbles: true }),
                new Event('change', { bubbles: true }),
                new KeyboardEvent('keydown', { bubbles: true }),
                new KeyboardEvent('keyup', { bubbles: true }),
                new Event('blur', { bubbles: true })
            ];

            events.forEach(event => element.dispatchEvent(event));

            // Restore original state
            element.readOnly = wasReadOnly;
            element.disabled = wasDisabled;

            return true;
        } catch (error) {
            console.error('Smart fill error:', error);
            return false;
        }
    }

    /**
     * Find field by multiple strategies
     */
    function findField(identifiers) {
        for (const id of identifiers) {
            // Try by ID
            let field = document.getElementById(id);
            if (field) return field;

            // Try by name
            field = document.querySelector(`[name="${id}"]`);
            if (field) return field;

            // Try by placeholder
            field = document.querySelector(`[placeholder*="${id}"]`);
            if (field) return field;

            // Try by label
            const label = Array.from(document.querySelectorAll('label')).find(
                l => l.textContent.toLowerCase().includes(id.toLowerCase())
            );
            if (label) {
                const forAttr = label.getAttribute('for');
                if (forAttr) {
                    field = document.getElementById(forAttr);
                    if (field) return field;
                }
            }
        }
        return null;
    }

    /**
     * Auto-fill application info fields
     */
    function autoFillApplicationInfo() {
        const fieldMap = {
            webfile_id: ['webfile_id', 'webFileId', 'web_file', 'webfile'],
            webfile_id_repeat: ['webfile_id_repeat', 'webFileIdRepeat', 'web_file_repeat'],
            ivac_id: ['ivac_id', 'ivacId', 'ivac'],
            visa_type: ['visa_type', 'visaType', 'visa'],
            family_count: ['family_count', 'familyCount', 'family'],
            visit_purpose: ['asweoi_erilfs', 'visit_purpose', 'purpose']
        };

        const data = {
            webfile_id: document.getElementById('webfile-id')?.value || PERSONAL_INFO.webfile_id,
            webfile_id_repeat: document.getElementById('webfile-id-repeat')?.value || PERSONAL_INFO.webfile_id,
            ivac_id: document.getElementById('ivac-id')?.value || '5',
            visa_type: document.getElementById('visa-type')?.value || '13',
            family_count: document.getElementById('family-count')?.value || '3',
            visit_purpose: document.getElementById('visit-purpose')?.value || 'CARDIOVASCULAR TREATMENT'
        };

        let filledCount = 0;
        Object.entries(fieldMap).forEach(([key, identifiers]) => {
            const field = findField(identifiers);
            if (field && smartFillField(field, data[key])) {
                filledCount++;
                field.style.background = '#e8f5e9';
                setTimeout(() => {
                    field.style.background = '';
                }, 2000);
            }
        });

        return filledCount;
    }

    /**
     * Auto-fill personal info fields
     */
    function autoFillPersonalInfo() {
        const fieldMap = {
            full_name: ['full_name', 'fullName', 'name', 'applicant_name'],
            email: ['email_name', 'email', 'e-mail', 'emailName'],
            phone: ['phone', 'mobile', 'mobile_no', 'contact']
        };

        const data = {
            full_name: document.getElementById('personal-full-name')?.value || PERSONAL_INFO.full_name,
            email: document.getElementById('personal-email')?.value || PERSONAL_INFO.email_name,
            phone: document.getElementById('personal-phone')?.value || PERSONAL_INFO.phone
        };

        let filledCount = 0;
        Object.entries(fieldMap).forEach(([key, identifiers]) => {
            const field = findField(identifiers);
            if (field && smartFillField(field, data[key])) {
                filledCount++;
                field.style.background = '#e8f5e9';
                setTimeout(() => {
                    field.style.background = '';
                }, 2000);
            }
        });

        return filledCount;
    }

    /**
     * Auto-fill family member fields
     */
    function autoFillFamilyMembers() {
        const familyCount = parseInt(document.getElementById('family-count')?.value) || 3;
        let filledCount = 0;

        for (let i = 1; i <= familyCount; i++) {
            const member = PERSONAL_INFO.family[i];
            if (!member) continue;

            const fieldMap = {
                name: [`family[${i}][name]`, `family_${i}_name`, `family_name_${i}`],
                webfile: [`family[${i}][webfile_no]`, `family_${i}_webfile`, `family_webfile_${i}`],
                webfile_repeat: [`family[${i}][again_webfile_no]`, `family_${i}_webfile_repeat`, `family_webfile_repeat_${i}`]
            };

            const data = {
                name: document.getElementById(`family-name-${i}`)?.value || member.name,
                webfile: document.getElementById(`family-webfile-${i}`)?.value || member.webfile_no,
                webfile_repeat: document.getElementById(`family-webfile-repeat-${i}`)?.value || member.again_webfile_no
            };

            Object.entries(fieldMap).forEach(([key, identifiers]) => {
                const field = findField(identifiers);
                if (field && smartFillField(field, data[key])) {
                    filledCount++;
                    field.style.background = '#fff3e0';
                    setTimeout(() => {
                        field.style.background = '';
                    }, 2000);
                }
            });
        }

        return filledCount;
    }

    /**
     * Master auto-fill function
     */
    function autoFillAllFields() {
        updateBookingStatus('🔄 Starting smart auto-fill...', 'info');

        setTimeout(() => {
            const appCount = autoFillApplicationInfo();
            const personalCount = autoFillPersonalInfo();
            const familyCount = autoFillFamilyMembers();

            const totalFilled = appCount + personalCount + familyCount;

            if (totalFilled > 0) {
                updateBookingStatus(
                    `✅ Auto-filled ${totalFilled} fields successfully!<br>` +
                    `📝 Application: ${appCount} | Personal: ${personalCount} | Family: ${familyCount}`,
                    'success'
                );
            } else {
                updateBookingStatus(
                    '⚠️ No fields found to auto-fill. Make sure you\'re on the correct page.',
                    'warning'
                );
            }
        }, 500);
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScript);
    } else {
        initScript();
    }

    function initScript() {
        console.log('IVAC Assistant v6.0 initializing...');
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
                <h3 style="margin: 0; font-size: 16px; font-weight: bold;">IVAC Assistant v6.0 🚀</h3>
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
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Access Token:</label>
                <div style="display: flex; gap: 5px;">
                    <input type="text" id="access-token-display" style="
                        flex: 1;
                        padding: 8px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        background: #f0f8ff;
                        font-size: 11px;
                        box-sizing: border-box;
                    " placeholder="Token will appear here after successful login" readonly>
                    <button id="refresh-token-btn" style="
                        padding: 8px 12px;
                        background: #6f42c1;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 11px;
                    " title="Load token from localStorage">Load</button>
                </div>
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Captcha Token:</label>
                <input type="text" id="captcha-token" readonly style="
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    background: #f9f9f9;
                    font-size: 11px;
                    box-sizing: border-box;
                " placeholder="Token will appear here after verification">
            </div>

            <div style="display: flex; margin-bottom: 15px; gap: 10px;">
                <input type="text" id="sitekey" value="${CLOUDFLARE_SITEKEYS.login}" placeholder="Enter Cloudflare sitekey" style="
                    flex: 2;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    box-sizing: border-box;
                ">
                <button id="load-captcha" style="
                    flex: 1;
                    padding: 8px 12px;
                    background: #007cba;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    white-space: nowrap;
                    min-width: 100px;
                ">Load CAPTCHA</button>
            </div>

            <div id="captcha-container" style="
                margin-bottom: 15px;
                min-height: 80px;
                border: 1px dashed #ccc;
                border-radius: 4px;
                padding: 10px;
                text-align: center;
                color: #666;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                Click "Load CAPTCHA" to verify
            </div>

            <div style="display: flex; margin-bottom: 15px; gap: 10px;">
                <input type="tel" id="mobile-number" placeholder="Enter mobile number" style="
                    flex: 1;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    box-sizing: border-box;
                " maxlength="11">
                <button id="verify-mobile" style="
                    padding: 8px 12px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    min-width: 80px;
                " disabled>Proceed</button>
            </div>

            <div style="display: flex; margin-bottom: 15px; gap: 10px;">
                <input type="password" id="password" placeholder="Enter password" style="
                    flex: 1;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    box-sizing: border-box;
                ">
                <button id="submit-password" style="
                    padding: 8px 12px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    min-width: 80px;
                " disabled>Proceed</button>
            </div>

            <div style="display: flex; margin-bottom: 15px; gap: 10px;">
                <input type="text" id="otp" placeholder="Enter OTP" style="
                    flex: 1;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    box-sizing: border-box;
                " maxlength="6">
                <button id="submit-otp" style="
                    padding: 8px 12px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    min-width: 80px;
                " disabled>Submit OTP</button>
            </div>

            <div id="status" style="
                margin-top: 15px;
                padding: 10px;
                border-radius: 4px;
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                font-size: 12px;
                line-height: 1.4;
            ">
                Ready to start login process...
            </div>
        `;
    }

    function createBookingTabContent() {
        return `
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Access Token:</label>
                <div style="display: flex; gap: 5px;">
                    <input type="text" id="booking-access-token" style="
                        flex: 1;
                        padding: 8px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        background: #f0f8ff;
                        font-size: 11px;
                        box-sizing: border-box;
                    " placeholder="Access token from login" readonly>
                    <button id="booking-refresh-token-btn" style="
                        padding: 8px 12px;
                        background: #6f42c1;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 11px;
                    " title="Load token from localStorage">Load</button>
                </div>
            </div>

            <!-- NEW: Quick Auto-Fill Button -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <button id="quick-autofill-btn" style="
                    width: 100%;
                    padding: 12px 20px;
                    background: white;
                    color: #667eea;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 14px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    transition: all 0.3s;
                ">
                    🚀 AUTO-FILL ALL FIELDS (Smart Mode)
                </button>
                <p style="margin: 10px 0 0 0; color: white; font-size: 11px; text-align: center;">
                    Automatically fills Application Info & Personal Info fields on the page
                </p>
            </div>

            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="margin: 0 0 15px 0; color: #495057; font-size: 14px;">Application Info Preview</h4>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                    <div>
                        <label style="display: block; font-size: 11px; color: #666; margin-bottom: 3px;">API Endpoint:</label>
                        <input type="text" id="api-endpoint" value="/api/v2/payment/application-r5s7h3-submit-hyju6t" style="
                            width: 100%;
                            padding: 6px;
                            border: 1px solid #ddd;
                            border-radius: 4px;
                            font-size: 11px;
                            box-sizing: border-box;
                        ">
                    </div>
                    <div>
                        <label style="display: block; font-size: 11px; color: #666; margin-bottom: 3px;">High Commission:</label>
                        <input type="text" id="highcom" value="2" readonly style="
                            width: 100%;
                            padding: 6px;
                            border: 1px solid #ddd;
                            border-radius: 4px;
                            background: #f9f9f9;
                            font-size: 11px;
                            box-sizing: border-box;
                        ">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                    <div>
                        <label style="display: block; font-size: 11px; color: #666; margin-bottom: 3px;">Web File ID:</label>
                        <input type="text" id="webfile-id" value="${PERSONAL_INFO.webfile_id}" class="editable-field" style="
                            width: 100%;
                            padding: 6px;
                            border: 1px solid #ddd;
                            border-radius: 4px;
                            background: #f9f9f9;
                            font-size: 11px;
                            box-sizing: border-box;
                        " readonly>
                    </div>
                    <div>
                        <label style="display: block; font-size: 11px; color: #666; margin-bottom: 3px;">Web File ID Repeat:</label>
                        <input type="text" id="webfile-id-repeat" value="${PERSONAL_INFO.webfile_id}" class="editable-field" style="
                            width: 100%;
                            padding: 6px;
                            border: 1px solid #ddd;
                            border-radius: 4px;
                            background: #f9f9f9;
                            font-size: 11px;
                            box-sizing: border-box;
                        " readonly>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                    <div>
                        <label style="display: block; font-size: 11px; color: #666; margin-bottom: 3px;">IVAC ID:</label>
                        <input type="text" id="ivac-id" value="5" readonly style="
                            width: 100%;
                            padding: 6px;
                            border: 1px solid #ddd;
                            border-radius: 4px;
                            background: #f9f9f9;
                            font-size: 11px;
                            box-sizing: border-box;
                        ">
                    </div>
                    <div>
                        <label style="display: block; font-size: 11px; color: #666; margin-bottom: 3px;">Visa Type:</label>
                        <input type="text" id="visa-type" value="13" readonly style="
                            width: 100%;
                            padding: 6px;
                            border: 1px solid #ddd;
                            border-radius: 4px;
                            background: #f9f9f9;
                            font-size: 11px;
                            box-sizing: border-box;
                        ">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                    <div>
                        <label style="display: block; font-size: 11px; color: #666; margin-bottom: 3px;">Family Count:</label>
                        <input type="text" id="family-count" value="3" class="editable-field" style="
                            width: 100%;
                            padding: 6px;
                            border: 1px solid #ddd;
                            border-radius: 4px;
                            background: #f9f9f9;
                            font-size: 11px;
                            box-sizing: border-box;
                        " readonly>
                    </div>
                    <div>
                        <label style="display: block; font-size: 11px; color: #666; margin-bottom: 3px;">Captcha Field Name:</label>
                        <input type="text" id="captcha-field-name" value="y6e7uk_token_t6d8n3" style="
                            width: 100%;
                            padding: 6px;
                            border: 1px solid #ddd;
                            border-radius: 4px;
                            font-size: 11px;
                            box-sizing: border-box;
                        ">
                    </div>
                </div>

                <div style="margin-bottom: 10px;">
                    <label style="display: block; font-size: 11px; color: #666; margin-bottom: 3px;">Visit Purpose:</label>
                    <textarea id="visit-purpose" class="editable-field" readonly style="
                        width: 100%;
                        padding: 6px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        background: #f9f9f9;
                        font-size: 11px;
                        box-sizing: border-box;
                        resize: vertical;
                        height: 60px;
                    ">CARDIOVASCULAR TREATMENT</textarea>
                </div>

                <div style="margin-bottom: 10px;">
                    <button id="parse-fill-btn" style="
                        width: 100%;
                        padding: 8px 12px;
                        background: #17a2b8;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Parse & Fill</button>
                </div>
            </div>

            <div style="display: flex; margin-bottom: 15px; gap: 10px;">
                <input type="text" id="booking-sitekey" value="${CLOUDFLARE_SITEKEYS.booking}" placeholder="Enter Cloudflare sitekey" style="
                    flex: 2;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    box-sizing: border-box;
                ">
                <button id="show-captcha-btn" style="
                    flex: 1;
                    padding: 8px 12px;
                    background: #fd7e14;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    white-space: nowrap;
                    min-width: 100px;
                ">Load CAPTCHA</button>
            </div>

            <div id="booking-captcha-container" style="
                margin-bottom: 15px;
                min-height: 80px;
                border: 1px dashed #ccc;
                border-radius: 4px;
                padding: 10px;
                text-align: center;
                color: #666;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                Click "Load CAPTCHA" to load captcha widget
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; font-size: 11px; color: #666; margin-bottom: 3px;">Captcha Token:</label>
                <input type="text" id="booking-captcha-token" readonly style="
                    width: 100%;
                    padding: 6px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    background: #f9f9f9;
                    font-size: 11px;
                    box-sizing: border-box;
                " placeholder="Will be filled after captcha verification">
            </div>

            <div style="background: #e8f5e8; border-radius: 8px; margin-bottom: 15px; border: 2px solid #28a745;">
                <div style="padding: 15px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;" id="personal-info-header">
                    <h4 style="margin: 0; color: #155724; font-size: 14px;">📋 Personal Info Preview (Hardcoded)</h4>
                    <span id="personal-toggle" style="color: #155724; font-weight: bold;">−</span>
                </div>
                <div id="personal-info-content" style="padding: 0 15px 15px 15px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                        <div>
                            <label style="display: block; font-size: 11px; color: #155724; margin-bottom: 3px; font-weight: bold;">Full Name:</label>
                            <input type="text" id="personal-full-name" value="${PERSONAL_INFO.full_name}" style="
                                width: 100%;
                                padding: 6px;
                                border: 1px solid #28a745;
                                border-radius: 4px;
                                background: #f8fff8;
                                font-size: 11px;
                                box-sizing: border-box;
                            ">
                        </div>
                        <div>
                            <label style="display: block; font-size: 11px; color: #155724; margin-bottom: 3px; font-weight: bold;">Email:</label>
                            <input type="email" id="personal-email" value="${PERSONAL_INFO.email_name}" style="
                                width: 100%;
                                padding: 6px;
                                border: 1px solid #28a745;
                                border-radius: 4px;
                                background: #f8fff8;
                                font-size: 11px;
                                box-sizing: border-box;
                            ">
                        </div>
                        <div>
                            <label style="display: block; font-size: 11px; color: #155724; margin-bottom: 3px; font-weight: bold;">Phone:</label>
                            <input type="text" id="personal-phone" value="${PERSONAL_INFO.phone}" style="
                                width: 100%;
                                padding: 6px;
                                border: 1px solid #28a745;
                                border-radius: 4px;
                                background: #f8fff8;
                                font-size: 11px;
                                box-sizing: border-box;
                            ">
                        </div>
                    </div>
                </div>
            </div>

            <div style="background: #fff3e0; border-radius: 8px; margin-bottom: 15px; border: 2px solid #ff9800;">
                <div style="padding: 15px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;" id="family-info-header">
                    <h4 style="margin: 0; color: #e65100; font-size: 14px;">👨‍👩‍👧‍👦 Family Members Preview (Hardcoded)</h4>
                    <span id="family-toggle" style="color: #e65100; font-weight: bold;">−</span>
                </div>
                <div id="family-info-content">
                    ${generateFamilyMembersHTML()}
                </div>
            </div>

            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <button id="submit-application-info" style="
                    flex: 1;
                    padding: 8px 12px;
                    background: #28a745;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                ">Application Info</button>
                <button id="submit-personal-info" style="
                    flex: 1;
                    padding: 8px 12px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                " disabled>Personal Info</button>
                <button id="submit-overview" style="
                    flex: 1;
                    padding: 8px 12px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                " disabled>Overview</button>
            </div>

            <div id="booking-status" style="
                margin-top: 15px;
                padding: 10px;
                border-radius: 4px;
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                font-size: 12px;
                line-height: 1.4;
            ">
                Ready to start booking process... Personal info is hardcoded and ready to submit.
            </div>
        `;
    }

    function createPaymentTabContent() {
        return `
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Access Token:</label>
                <div style="display: flex; gap: 5px;">
                    <input type="text" id="payment-access-token" style="
                        flex: 1;
                        padding: 8px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        background: #f0f8ff;
                        font-size: 11px;
                        box-sizing: border-box;
                    " placeholder="Access token from login" readonly>
                    <button id="payment-refresh-token-btn" style="
                        padding: 8px 12px;
                        background: #6f42c1;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 11px;
                    " title="Load token from localStorage">Load</button>
                </div>
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Payment API Endpoint:</label>
                <input type="text" id="payment-api-endpoint" value="/api/v2/payment/h7j3wt-now-y0k3d6" style="
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 11px;
                    box-sizing: border-box;
                ">
            </div>

            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #dee2e6;">
                <h4 style="margin: 0 0 15px 0; color: #495057; font-size: 14px;">💳 Payment Method Selection</h4>
                <div style="display: flex; gap: 15px;">
                    <label style="display: flex; align-items: center; cursor: pointer; padding: 12px; border: 2px solid #dee2e6; border-radius: 8px; background: white; min-width: 120px;">
                        <input type="radio" name="payment-method" value="visacard" checked style="margin-right: 10px;">
                        <img src="https://securepay.sslcommerz.com/gwprocess/v4/image/gw1/visa.png" alt="VISA" style="width: 60px; height: auto; object-fit: contain; margin-right: 8px;">
                        <span style="font-weight: bold; color: #333;">VISA</span>
                    </label>
                    <label style="display: flex; align-items: center; cursor: pointer; padding: 12px; border: 2px solid #dee2e6; border-radius: 8px; background: white; min-width: 120px;">
                        <input type="radio" name="payment-method" value="mastercard" style="margin-right: 10px;">
                        <img src="https://securepay.sslcommerz.com/gwprocess/v4/image/gw1/master.png" alt="MASTER" style="width: 60px; height: auto; object-fit: contain; margin-right: 8px;">
                        <span style="font-weight: bold; color: #333;">MASTER</span>
                    </label>
                </div>
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">OTP Verification:</label>
                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 10px;">
                    <input type="text" id="payment-otp" placeholder="Enter OTP" maxlength="7" style="
                        padding: 8px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        box-sizing: border-box;
                    ">
                    <button id="send-otp-btn" style="
                        padding: 8px 12px;
                        background: #17a2b8;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Send</button>
                    <button id="verify-otp-btn" style="
                        padding: 8px 12px;
                        background: #6c757d;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    " disabled>Verify</button>
                </div>
            </div>

            <div style="display: flex; margin-bottom: 15px; gap: 10px;">
                <input type="text" id="payment-sitekey" value="${CLOUDFLARE_SITEKEYS.payment}" placeholder="Enter Cloudflare sitekey" style="
                    flex: 2;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    box-sizing: border-box;
                ">
                <button id="load-payment-captcha" style="
                    flex: 1;
                    padding: 8px 12px;
                    background: #007cba;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    white-space: nowrap;
                    min-width: 100px;
                ">Load CAPTCHA</button>
            </div>

            <div id="payment-captcha-container" style="
                margin-bottom: 15px;
                min-height: 80px;
                border: 1px dashed #ccc;
                border-radius: 4px;
                padding: 10px;
                text-align: center;
                color: #666;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                Click "Load CAPTCHA" to verify
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Captcha Field Name:</label>
                    <input type="text" id="payment-captcha-field-name" value="k5t0g8_token_y4v9f6" style="
                        width: 100%;
                        padding: 8px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        font-size: 11px;
                        box-sizing: border-box;
                    ">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Captcha Token:</label>
                    <input type="text" id="payment-captcha-token" readonly style="
                        width: 100%;
                        padding: 8px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        background: #f9f9f9;
                        font-size: 11px;
                        box-sizing: border-box;
                    " placeholder="Token will appear after captcha verification">
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Appointment Date:</label>
                    <select id="appointment-date" style="
                        width: 100%;
                        padding: 8px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        box-sizing: border-box;
                    ">
                        <option value="">Select appointment date</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Appointment Time:</label>
                    <select id="appointment-time" style="
                        width: 100%;
                        padding: 8px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        box-sizing: border-box;
                    " disabled>
                        <option value="">Select appointment time</option>
                    </select>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <button id="pay-slot-time-btn" style="
                    padding: 8px 12px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                " disabled>Pay Slot Time</button>
                <button id="default-slot-btn" style="
                    padding: 8px 12px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                " disabled>Default Slot</button>
                <button id="default-date-btn" style="
                    padding: 8px 12px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                " disabled>Default Date & Time</button>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <button id="pay-now-btn" style="
                    padding: 8px 12px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                " disabled>Pay Now</button>
                <button id="payment-btn" style="
                    padding: 8px 12px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                " disabled>Payment</button>
            </div>

            <div id="payment-status" style="
                margin-top: 15px;
                padding: 10px;
                border-radius: 4px;
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                font-size: 12px;
                line-height: 1.4;
            ">
                Ready to start payment process...
            </div>
        `;
    }

    function generateFamilyMembersHTML() {
        let html = '<div style="padding: 0 15px 15px 15px;">';

        for (let i = 1; i <= 4; i++) {
            const member = PERSONAL_INFO.family[i];
            if (!member) continue;

            html += `
                <div id="family-member-${i}" style="margin-bottom: 15px; padding: 10px; border: 1px solid #ffcc80; border-radius: 4px; background: #fffef7; ${i > 3 ? 'display: none;' : ''}">
                    <h5 style="margin: 0 0 10px 0; color: #e65100;">Family Member ${i}</h5>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                        <div>
                            <label style="display: block; font-size: 11px; color: #e65100; margin-bottom: 3px; font-weight: bold;">Full Name:</label>
                            <input type="text" id="family-name-${i}" value="${member.name}" style="
                                width: 100%;
                                padding: 6px;
                                border: 1px solid #ff9800;
                                border-radius: 4px;
                                background: #fffef7;
                                font-size: 11px;
                                box-sizing: border-box;
                            ">
                        </div>
                        <div>
                            <label style="display: block; font-size: 11px; color: #e65100; margin-bottom: 3px; font-weight: bold;">Web File ID:</label>
                            <input type="text" id="family-webfile-${i}" value="${member.webfile_no}" style="
                                width: 100%;
                                padding: 6px;
                                border: 1px solid #ff9800;
                                border-radius: 4px;
                                background: #fffef7;
                                font-size: 11px;
                                box-sizing: border-box;
                            ">
                        </div>
                        <div>
                            <label style="display: block; font-size: 11px; color: #e65100; margin-bottom: 3px; font-weight: bold;">Repeat Web File ID:</label>
                            <input type="text" id="family-webfile-repeat-${i}" value="${member.again_webfile_no}" style="
                                width: 100%;
                                padding: 6px;
                                border: 1px solid #ff9800;
                                border-radius: 4px;
                                background: #fffef7;
                                font-size: 11px;
                                box-sizing: border-box;
                            ">
                        </div>
                    </div>
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    // === TAB SWITCHING ===
    function setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;

                tabButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.style.background = '#f8f9fa';
                    btn.style.color = '#333';
                });

                tabContents.forEach(content => {
                    content.classList.remove('active');
                    content.style.display = 'none';
                });

                button.classList.add('active');
                button.style.background = '#007bff';
                button.style.color = 'white';

                const targetContent = document.getElementById(`${targetTab}-tab`);
                if (targetContent) {
                    targetContent.classList.add('active');
                    targetContent.style.display = 'block';
                }

                // Sync tokens
                const loginToken = document.getElementById('access-token-display').value;
                if (loginToken) {
                    if (targetTab === 'booking') {
                        document.getElementById('booking-access-token').value = loginToken;
                    } else if (targetTab === 'payment') {
                        document.getElementById('payment-access-token').value = loginToken;
                    }
                }
            });
        });
    }

    // === EVENT LISTENERS ===
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
        const loadCaptchaBtn = document.getElementById('load-captcha');
        const verifyMobileBtn = document.getElementById('verify-mobile');
        const submitPasswordBtn = document.getElementById('submit-password');
        const submitOtpBtn = document.getElementById('submit-otp');
        const refreshTokenBtn = document.getElementById('refresh-token-btn');

        loadCaptchaBtn.addEventListener('click', loadCloudflareWidget);
        verifyMobileBtn.addEventListener('click', verifyMobile);
        submitPasswordBtn.addEventListener('click', submitPassword);
        submitOtpBtn.addEventListener('click', submitOTP);
        refreshTokenBtn.addEventListener('click', loadAccessTokenFromStorage);

        // Enable/disable buttons based on input
        document.getElementById('mobile-number').addEventListener('input', (e) => {
            const token = document.getElementById('captcha-token').value;
            verifyMobileBtn.disabled = !token || !e.target.value;
            verifyMobileBtn.style.background = verifyMobileBtn.disabled ? '#6c757d' : '#28a745';
        });

        document.getElementById('password').addEventListener('input', (e) => {
            submitPasswordBtn.disabled = !e.target.value;
            submitPasswordBtn.style.background = submitPasswordBtn.disabled ? '#6c757d' : '#28a745';
        });

        document.getElementById('otp').addEventListener('input', (e) => {
            submitOtpBtn.disabled = !e.target.value;
            submitOtpBtn.style.background = submitOtpBtn.disabled ? '#6c757d' : '#28a745';
        });
    }

    function setupBookingEventListeners() {
        const parseFillBtn = document.getElementById('parse-fill-btn');
        const showCaptchaBtn = document.getElementById('show-captcha-btn');
        const submitApplicationBtn = document.getElementById('submit-application-info');
        const submitPersonalBtn = document.getElementById('submit-personal-info');
        const submitOverviewBtn = document.getElementById('submit-overview');
        const bookingRefreshTokenBtn = document.getElementById('booking-refresh-token-btn');
        const familyCountInput = document.getElementById('family-count');
        const quickAutofillBtn = document.getElementById('quick-autofill-btn');

        parseFillBtn.addEventListener('click', toggleEditableFields);
        showCaptchaBtn.addEventListener('click', loadBookingCaptcha);
        submitApplicationBtn.addEventListener('click', submitApplicationInfo);
        submitPersonalBtn.addEventListener('click', submitPersonalInfo);
        submitOverviewBtn.addEventListener('click', submitOverview);
        bookingRefreshTokenBtn.addEventListener('click', loadBookingAccessTokenFromStorage);
        familyCountInput.addEventListener('input', updateFamilyMembersDisplay);

        // NEW: Quick Auto-fill button
        quickAutofillBtn.addEventListener('click', autoFillAllFields);
        quickAutofillBtn.addEventListener('mouseenter', () => {
            quickAutofillBtn.style.transform = 'scale(1.05)';
            quickAutofillBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        });
        quickAutofillBtn.addEventListener('mouseleave', () => {
            quickAutofillBtn.style.transform = 'scale(1)';
            quickAutofillBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        });

        // Collapsible sections
        document.getElementById('personal-info-header').addEventListener('click', () => {
            const content = document.getElementById('personal-info-content');
            const toggle = document.getElementById('personal-toggle');
            if (content.style.display === 'none') {
                content.style.display = 'block';
                toggle.textContent = '−';
            } else {
                content.style.display = 'none';
                toggle.textContent = '+';
            }
        });

        document.getElementById('family-info-header').addEventListener('click', () => {
            const content = document.getElementById('family-info-content');
            const toggle = document.getElementById('family-toggle');
            if (content.style.display === 'none') {
                content.style.display = 'block';
                toggle.textContent = '−';
            } else {
                content.style.display = 'none';
                toggle.textContent = '+';
            }
        });
    }

    function setupPaymentEventListeners() {
        const paymentRefreshTokenBtn = document.getElementById('payment-refresh-token-btn');
        const sendOtpBtn = document.getElementById('send-otp-btn');
        const verifyOtpBtn = document.getElementById('verify-otp-btn');
        const loadPaymentCaptchaBtn = document.getElementById('load-payment-captcha');
        const paySlotTimeBtn = document.getElementById('pay-slot-time-btn');
        const defaultSlotBtn = document.getElementById('default-slot-btn');
        const defaultDateBtn = document.getElementById('default-date-btn');
        const payNowBtn = document.getElementById('pay-now-btn');
        const paymentBtn = document.getElementById('payment-btn');

        paymentRefreshTokenBtn.addEventListener('click', loadPaymentAccessTokenFromStorage);
        sendOtpBtn.addEventListener('click', () => sendPaymentOTP(0));
        verifyOtpBtn.addEventListener('click', verifyPaymentOTP);
        loadPaymentCaptchaBtn.addEventListener('click', loadPaymentCaptcha);
        paySlotTimeBtn.addEventListener('click', getPaymentSlotTime);
        defaultSlotBtn.addEventListener('click', setDefaultSlot);
        defaultDateBtn.addEventListener('click', setDefaultDateTime);
        payNowBtn.addEventListener('click', submitPayment);
        paymentBtn.addEventListener('click', openPaymentLink);

        document.getElementById('payment-otp').addEventListener('input', (e) => {
            const otpValue = e.target.value;
            verifyOtpBtn.disabled = otpValue.length < 6;
            verifyOtpBtn.style.background = verifyOtpBtn.disabled ? '#6c757d' : '#28a745';
        });

        document.getElementById('appointment-date').addEventListener('change', handleAppointmentDateChange);
    }

    // === UTILITY FUNCTIONS ===
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
            const minWidth = 400;
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
            container.style.maxHeight = '85vh';
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

        const authName = localStorage.getItem('auth_name');
        const authEmail = localStorage.getItem('auth_email');
        const authPhone = localStorage.getItem('auth_phone');

        if (authName || authEmail || authPhone) {
            updateStatus('Existing session data loaded. You may be already logged in.', 'info');
            updateBookingStatus('Session data available. Personal info is hardcoded and ready to use.', 'info');
        }
    }

    function updateStatus(message, type = 'info') {
        const statusDiv = document.getElementById('status');
        const colors = {
            info: '#d1ecf1',
            success: '#d4edda',
            error: '#f8d7da',
            warning: '#fff3cd'
        };
        statusDiv.style.backgroundColor = colors[type] || colors.info;
        statusDiv.innerHTML = message;
        console.log(`[IVAC - Login] ${message}`);
    }

    function updateBookingStatus(message, type = 'info') {
        const statusDiv = document.getElementById('booking-status');
        const colors = {
            info: '#d1ecf1',
            success: '#d4edda',
            error: '#f8d7da',
            warning: '#fff3cd'
        };
        statusDiv.style.backgroundColor = colors[type] || colors.info;
        statusDiv.innerHTML = message;
        console.log(`[IVAC - Booking] ${message}`);
    }

    function updatePaymentStatus(message, type = 'info') {
        const statusDiv = document.getElementById('payment-status');
        const colors = {
            info: '#d1ecf1',
            success: '#d4edda',
            error: '#f8d7da',
            warning: '#fff3cd'
        };
        statusDiv.style.backgroundColor = colors[type] || colors.info;
        statusDiv.innerHTML = message;
        console.log(`[IVAC - Payment] ${message}`);
    }

    function loadAccessTokenFromStorage() {
        const token = localStorage.getItem('access_token');
        if (token) {
            document.getElementById('access-token-display').value = token;
            document.getElementById('booking-access-token').value = token;
            document.getElementById('payment-access-token').value = token;
            updateStatus('Access token loaded from localStorage', 'success');
        } else {
            updateStatus('No access token found in localStorage', 'warning');
        }
    }

    function loadBookingAccessTokenFromStorage() {
        const token = localStorage.getItem('access_token');
        if (token) {
            document.getElementById('booking-access-token').value = token;
            updateBookingStatus('Access token loaded from localStorage', 'success');
        } else {
            updateBookingStatus('No access token found in localStorage', 'warning');
        }
    }

    function loadPaymentAccessTokenFromStorage() {
        const token = localStorage.getItem('access_token');
        if (token) {
            document.getElementById('payment-access-token').value = token;
            updatePaymentStatus('Access token loaded from localStorage', 'success');
        } else {
            updatePaymentStatus('No access token found in localStorage', 'warning');
        }
    }

    function updateFamilyMembersDisplay() {
        const familyCount = parseInt(document.getElementById('family-count').value) || 0;
        for (let i = 1; i <= 4; i++) {
            const memberDiv = document.getElementById(`family-member-${i}`);
            if (memberDiv) {
                memberDiv.style.display = i <= familyCount ? 'block' : 'none';
            }
        }
        updateBookingStatus(`Family members display updated: showing ${familyCount} members`, 'info');
    }

    function toggleEditableFields() {
        const editableFields = document.querySelectorAll('.editable-field');
        const button = document.getElementById('parse-fill-btn');

        editableFields.forEach(field => {
            if (field.readOnly) {
                field.readOnly = false;
                field.style.background = '#ffffff';
                field.style.border = '2px solid #007bff';
            } else {
                field.readOnly = true;
                field.style.background = '#f9f9f9';
                field.style.border = '1px solid #ddd';
            }
        });

        button.textContent = button.textContent === 'Parse & Fill' ? 'Lock Fields' : 'Parse & Fill';
        button.style.background = button.textContent === 'Lock Fields' ? '#dc3545' : '#17a2b8';
    }

    // === API FUNCTIONS ===
    async function customFetch(url, options) {

            // Get CSRF token from meta tag or cookie
        const csrfToken = getCsrfToken();
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
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

     // === HELPER FUNCTIONS ===
 function getCsrfToken() {
    // Try to get from meta tag
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
        return metaTag.getAttribute('content');
    }
    
    // Try to get from cookie
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'XSRF-TOKEN') {
            return decodeURIComponent(value);
        }
    }
    // If not found, try to fetch it
    return '';
}
    
    // === LOGIN FUNCTIONS ===
    function loadCloudflareWidget() {
        const sitekey = document.getElementById('sitekey').value.trim();
        if (!sitekey) {
            updateStatus('Please enter the Cloudflare sitekey', 'error');
            return;
        }

        updateStatus('Loading Cloudflare widget...', 'info');
        const container = document.getElementById('captcha-container');
        container.innerHTML = '';

        if (!window.turnstile) {
            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
            script.onload = () => renderWidget(sitekey);
            document.head.appendChild(script);
        } else {
            renderWidget(sitekey);
        }
    }

    function renderWidget(sitekey) {
        const container = document.getElementById('captcha-container');
        try {
            window.turnstile.render(container, {
                sitekey: sitekey,
                callback: function(token) {
                    document.getElementById('captcha-token').value = token;
                    updateStatus('Captcha verified successfully!', 'success');
                    const mobileInput = document.getElementById('mobile-number');
                    const verifyBtn = document.getElementById('verify-mobile');
                    if (mobileInput.value) {
                        verifyBtn.disabled = false;
                        verifyBtn.style.background = '#28a745';
                    }
                },
                'error-callback': function() {
                    updateStatus('Captcha verification failed', 'error');
                    document.getElementById('captcha-token').value = '';
                }
            });
            updateStatus('Cloudflare widget loaded. Please complete verification.', 'info');
        } catch (error) {
            updateStatus('Error loading Cloudflare widget: ' + error.message, 'error');
        }
    }

    async function verifyMobile() {
        const mobileNumber = document.getElementById('mobile-number').value.trim();
        const captchaToken = document.getElementById('captcha-token').value.trim();

        if (!mobileNumber || !captchaToken) {
            updateStatus('Please enter mobile number and complete captcha verification', 'error');
            return;
        }

        updateStatus('Sending mobile verification request...', 'info');

        try {
            const result = await customFetch('/api/v2/mobile-verify', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'language': 'en'
                },
                body: {
                    mobile_no: mobileNumber,
                    captcha_token: captchaToken,
                    problem: "abc",
                    answer: 1
                }
            });

            if (result.status_code === 200) {
                updateStatus('Mobile verification successful! You can now enter password.', 'success');
                const passwordBtn = document.getElementById('submit-password');
                passwordBtn.disabled = false;
                passwordBtn.style.background = '#28a745';
                localStorage.setItem('user_phone', mobileNumber);
            } else {
                updateStatus(`Mobile verification failed: ${result.message || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            updateStatus(`Network error: ${error.message}`, 'error');
        }
    }

    async function submitPassword() {
        const mobileNumber = document.getElementById('mobile-number').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!mobileNumber || !password) {
            updateStatus('Please enter both mobile number and password', 'error');
            return;
        }

        updateStatus('Submitting password...', 'info');

        try {
            const result = await customFetch('/api/v2/jktwdasf-345432-afawerk', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'language': 'en'
                },
                body: {
                    mobile_no: mobileNumber,
                    password: password
                }
            });

            if (result.status_code === 200) {
                updateStatus('Password submitted successfully! Please enter OTP.', 'success');
                localStorage.setItem('user_pwd', password);
            } else if (result.status === 504 || result.status_code === 504) {
                updateStatus('⚠️ Server timeout (504), but OTP might still be sent. Please check your email and try entering OTP.', 'warning');
                localStorage.setItem('user_pwd', password);
            } else {
                updateStatus(`Password submission failed: ${result.message || 'Unknown error'}`, 'error');
            }

            const otpBtn = document.getElementById('submit-otp');
            otpBtn.disabled = false;
            otpBtn.style.background = '#28a745';

        } catch (error) {
            if (error.status === 504) {
                updateStatus('⚠️ Server timeout (504), but OTP might still be sent. Please check your email and try entering OTP.', 'warning');
                localStorage.setItem('user_pwd', password);
            } else {
                updateStatus(`Network error: ${error.message}`, 'error');
            }

            const otpBtn = document.getElementById('submit-otp');
            otpBtn.disabled = false;
            otpBtn.style.background = '#28a745';
        }
    }

async function submitOTP() {
    const otp = document.getElementById('otp').value.trim();
    if (!otp) {
        updateStatus('Please enter OTP', 'error');
        return;
    }

    let mobileNumber = localStorage.getItem('user_phone') || document.getElementById('mobile-number').value.trim();
    let password = localStorage.getItem('user_pwd') || document.getElementById('password').value.trim();

    if (!mobileNumber || !password) {
        updateStatus('Missing mobile number or password. Please fill them in the form above.', 'error');
        return;
    }

    updateStatus('Submitting OTP...', 'info');

    try {
        const result = await customFetch('/api/v2/login-otp', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'language': 'en'
            },
            body: {
                mobile_no: mobileNumber,
                password: password,
                otp: otp
            }
        });

        if (result.status_code === 200) {
            const data = result.data;
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('auth_name', data.name);
            localStorage.setItem('auth_email', data.email);
            localStorage.setItem('auth_phone', data.mobile_no);
            localStorage.setItem('auth_photo', data.profile_image);
            localStorage.removeItem('user_pwd');

            document.getElementById('access-token-display').value = data.access_token;
            document.getElementById('booking-access-token').value = data.access_token;
            document.getElementById('payment-access-token').value = data.access_token;

            updateStatus('✅ Login completed successfully! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = '/application';
            }, 1500);
            
        } else {
            updateStatus(`OTP submission failed: ${result.message || 'Unknown error'}`, 'error');
        }
    } catch (error) {
        updateStatus(`Network error: ${error.message}`, 'error');
    }
}

    // === BOOKING FUNCTIONS ===
    function loadBookingCaptcha() {
        const sitekey = document.getElementById('booking-sitekey').value.trim();
        if (!sitekey) {
            updateBookingStatus('Please enter the Cloudflare sitekey', 'error');
            return;
        }

        updateBookingStatus('Loading Cloudflare widget...', 'info');
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
                    updateBookingStatus('Booking captcha verified successfully!', 'success');
                },
                'error-callback': function() {
                    updateBookingStatus('Booking captcha verification failed', 'error');
                    document.getElementById('booking-captcha-token').value = '';
                }
            });
            updateBookingStatus('Booking captcha widget loaded. Please complete verification.', 'info');
        } catch (error) {
            updateBookingStatus('Error loading booking captcha widget: ' + error.message, 'error');
        }
    }

    async function submitApplicationInfo() {
        const accessToken = document.getElementById('booking-access-token').value.trim();
        const captchaToken = document.getElementById('booking-captcha-token').value.trim();

        if (!accessToken) {
            updateBookingStatus('Please complete login first to get access token', 'error');
            return;
        }

        if (!captchaToken) {
            updateBookingStatus('Please complete captcha verification first', 'error');
            return;
        }

        updateBookingStatus('Submitting application info...', 'info');

        try {
            const apiEndpoint = document.getElementById('api-endpoint').value.trim();
            const captchaFieldName = document.getElementById('captcha-field-name').value.trim();

            const payload = {
                highcom: document.getElementById('highcom').value,
                webfile_id: document.getElementById('webfile-id').value,
                webfile_id_repeat: document.getElementById('webfile-id-repeat').value,
                ivac_id: document.getElementById('ivac-id').value,
                visa_type: document.getElementById('visa-type').value,
                family_count: document.getElementById('family-count').value,
                asweoi_erilfs: document.getElementById('visit-purpose').value,
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
                updateBookingStatus('Application info submitted successfully!', 'success');
                const personalBtn = document.getElementById('submit-personal-info');
                personalBtn.disabled = false;
                personalBtn.style.background = '#28a745';
                const appBtn = document.getElementById('submit-application-info');
                appBtn.disabled = true;
                appBtn.style.background = '#6c757d';
            } else if (result.status === 419 || result.status_code === 419) {
        // Don't reload, just show error and suggest manual action
        updateBookingStatus(
            '⚠️ Session expired or CSRF token invalid.<br>' +
            'Please try the following:<br>' +
            '1. Click the "Load" button next to Access Token<br>' +
            '2. Re-verify the captcha<br>' +
            '3. Try submitting again<br>' +
            'If the issue persists, you may need to manually refresh the page.',
            'error'
        );
        
        // Optionally try to refresh CSRF token automatically
        const newToken = await refreshCsrfToken();
        if (newToken) {
            updateBookingStatus(
                '✓ CSRF token refreshed. Please re-verify the captcha and try submitting again.',
                'warning'
            );
        }
    } else if (result.status === 429 || result.status_code === 429) {
        // Don't reload, just show error with wait time
        updateBookingStatus(
            '❌ Rate limit exceeded. Too many requests detected.<br>' +
            '<strong>Please wait 5-10 minutes before trying again.</strong><br>' +
            'Your IP may be temporarily blocked if you continue making rapid requests.<br>' +
            'Tips:<br>' +
            '• Wait at least 2-3 seconds between each action<br>' +
            '• Do not refresh or retry immediately<br>' +
            '• Make sure you have a stable internet connection',
            'error'
        );
    } else {
        updateBookingStatus(`Application info submission failed: ${result.message || 'Unknown error'}`, 'error');
    }
} catch (error) {
    if (error.status === 419) {
        updateBookingStatus(
            '⚠️ Session expired. Please:<br>' +
            '1. Click "Load" button to refresh access token<br>' +
            '2. Re-verify the captcha<br>' +
            '3. Try submitting again',
            'error'
        );
        
        // Try to refresh CSRF token
        await refreshCsrfToken();
    } else if (error.status === 429) {
        updateBookingStatus(
            '❌ Too many requests. Your IP may be temporarily blocked.<br>' +
            '<strong>Wait 5-10 minutes and avoid making rapid requests.</strong>',
            'error'
        );
    } else {
        updateBookingStatus(`Network error: ${error.message}`, 'error');
    }
}

    async function submitPersonalInfo() {
        const accessToken = document.getElementById('booking-access-token').value.trim();
        if (!accessToken) {
            updateBookingStatus('Please complete login first to get access token', 'error');
            return;
        }

        updateBookingStatus('Submitting personal info with hardcoded data...', 'info');

        try {
            const fullName = document.getElementById('personal-full-name').value.trim();
            const email = document.getElementById('personal-email').value.trim();
            const phone = document.getElementById('personal-phone').value.trim();
            const webfileId = document.getElementById('webfile-id').value;
            const familyCount = parseInt(document.getElementById('family-count').value) || 0;
            const family = {};

            for (let i = 1; i <= familyCount; i++) {
                const nameEl = document.getElementById(`family-name-${i}`);
                const webfileEl = document.getElementById(`family-webfile-${i}`);
                const webfileRepeatEl = document.getElementById(`family-webfile-repeat-${i}`);

                if (nameEl && webfileEl && webfileRepeatEl) {
                    family[i] = {
                        name: nameEl.value || '',
                        webfile_no: webfileEl.value || '',
                        again_webfile_no: webfileRepeatEl.value || ''
                    };
                }
            }

            const result = await customFetch('/api/v2/payment/personal-info-submit', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'language': 'en',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: {
                    full_name: fullName,
                    email_name: email,
                    phone: phone,
                    webfile_id: webfileId,
                    family: family
                }
            });

            if (result.status_code === 200) {
                updateBookingStatus(`Personal info submitted successfully with ${familyCount} family members!`, 'success');
                const overviewBtn = document.getElementById('submit-overview');
                overviewBtn.disabled = false;
                overviewBtn.style.background = '#28a745';
                const personalBtn = document.getElementById('submit-personal-info');
                personalBtn.disabled = true;
                personalBtn.style.background = '#6c757d';
            } else {
                updateBookingStatus(`Personal info submission failed: ${result.message || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            updateBookingStatus(`Network error: ${error.message}`, 'error');
        }
    }

    async function submitOverview() {
        const accessToken = document.getElementById('booking-access-token').value.trim();
        if (!accessToken) {
            updateBookingStatus('Please complete login first to get access token', 'error');
            return;
        }

        updateBookingStatus('Submitting overview...', 'info');

        try {
            const result = await customFetch('/api/v2/payment/overview-submit', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'language': 'en',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (result.status_code === 200) {
                updateBookingStatus('Overview submitted successfully! Booking process completed.', 'success');
                const overviewBtn = document.getElementById('submit-overview');
                overviewBtn.disabled = true;
                overviewBtn.style.background = '#6c757d';
                setTimeout(() => {
                    updateBookingStatus('🎉 Booking completed! You can now proceed to Payment tab if needed.', 'success');
                }, 2000);
            } else {
                updateBookingStatus(`Overview submission failed: ${result.message || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            updateBookingStatus(`Network error: ${error.message}`, 'error');
        }
    }

    // === PAYMENT FUNCTIONS ===
    async function sendPaymentOTP(resend = 0) {
        const accessToken = document.getElementById('payment-access-token').value.trim();
        if (!accessToken) {
            updatePaymentStatus('Please complete login first to get access token', 'error');
            return;
        }

        updatePaymentStatus('Sending payment OTP...', 'info');
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
                updatePaymentStatus('OTP sent successfully! Please check your phone.', 'success');
                const verifyBtn = document.getElementById('verify-otp-btn');
                verifyBtn.disabled = false;
                verifyBtn.style.background = '#28a745';
                startOTPCountdown(30);
            } else {
                updatePaymentStatus(`Failed to send OTP: ${result.message || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            updatePaymentStatus(`Network error: ${error.message}`, 'error');
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send';
        }
    }

    async function verifyPaymentOTP() {
        const accessToken = document.getElementById('payment-access-token').value.trim();
        const otp = document.getElementById('payment-otp').value.trim();

        if (!accessToken) {
            updatePaymentStatus('Please complete login first to get access token', 'error');
            return;
        }

        if (otp.length < 6) {
            updatePaymentStatus('Please enter 6 digit OTP', 'error');
            return;
        }

        updatePaymentStatus('Verifying OTP...', 'info');
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
                updatePaymentStatus('OTP verified successfully! Loading appointment dates...', 'success');

                let datePopulated = false;
                if (result.data && result.data.slot_dates) {
                    paymentData.slotDates = result.data.slot_dates;
                    try {
                        populateAppointmentDates(result.data.slot_dates);
                        datePopulated = true;
                    } catch (error) {
                        console.warn('Failed to populate dates:', error);
                        updatePaymentStatus('⚠️ Date population failed, using default date...', 'warning');
                    }
                }

                if (!datePopulated) {
                    setTimeout(() => {
                        setDefaultDateTime();
                        updatePaymentStatus('Using default date and time as fallback. You can change if needed.', 'info');
                    }, 1000);
                }

                document.getElementById('pay-slot-time-btn').disabled = false;
                document.getElementById('pay-slot-time-btn').style.background = '#fd7e14';
                document.getElementById('default-slot-btn').disabled = false;
                document.getElementById('default-slot-btn').style.background = '#6c757d';
                document.getElementById('default-date-btn').disabled = false;
                document.getElementById('default-date-btn').style.background = '#17a2b8';
            } else {
                updatePaymentStatus(`OTP verification failed: ${result.message || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            updatePaymentStatus(`Network error: ${error.message}`, 'error');
        } finally {
            verifyBtn.disabled = false;
            verifyBtn.textContent = 'Verify';
        }
    }

    function populateAppointmentDates(slotDates) {
        try {
            const dateSelect = document.getElementById('appointment-date');
            dateSelect.innerHTML = '<option value="">Select appointment date</option>';
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
                updatePaymentStatus(`${datesAdded} appointment dates loaded successfully!`, 'success');
                return true;
            } else {
                throw new Error('No valid dates found in server response');
            }
        } catch (error) {
            console.error('Date population error:', error);
            updatePaymentStatus(`Failed to populate dates: ${error.message}`, 'error');
            return false;
        }
    }

    async function handleAppointmentDateChange(event) {
        const selectedDate = event.target.value;
        if (!selectedDate) return;

        const accessToken = document.getElementById('payment-access-token').value.trim();
        updatePaymentStatus('Loading appointment times...', 'info');

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

            if (result.status_code === 200) {
                if (result.data && result.data.slot_times) {
                    paymentData.slotTimes = result.data.slot_times;
                    populateAppointmentTimes(result.data.slot_times);
                    updatePaymentStatus('Appointment times loaded successfully!', 'success');
                } else {
                    updatePaymentStatus('No appointment times available for selected date', 'warning');
                }
            } else {
                updatePaymentStatus(`Failed to load appointment times: ${result.message || 'Server error'}`, 'error');
            }
        } catch (error) {
            updatePaymentStatus(`Network error loading appointment times: ${error.message}`, 'error');
        }
    }

    function populateAppointmentTimes(slotTimes) {
        const timeSelect = document.getElementById('appointment-time');
        timeSelect.innerHTML = '<option value="">Select appointment time</option>';
        timeSelect.disabled = false;

        slotTimes.forEach(slot => {
            const option = document.createElement('option');
            option.value = slot.time_display;
            option.textContent = slot.time_display;
            timeSelect.appendChild(option);
        });
    }

    async function getPaymentSlotTime() {
        const accessToken = document.getElementById('payment-access-token').value.trim();
        const selectedDate = document.getElementById('appointment-date').value;

        if (!accessToken) {
            updatePaymentStatus('Please complete login first', 'error');
            return;
        }

        if (!selectedDate) {
            updatePaymentStatus('Please select appointment date first', 'error');
            return;
        }

        updatePaymentStatus('Manually fetching slot times...', 'info');
        const button = document.getElementById('pay-slot-time-btn');
        button.disabled = true;
        button.textContent = 'Loading...';

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

            if (result.status_code === 200) {
                if (result.data && result.data.slot_times) {
                    paymentData.slotTimes = result.data.slot_times;
                    populateAppointmentTimes(result.data.slot_times);
                    updatePaymentStatus('Slot times loaded successfully!', 'success');
                } else {
                    updatePaymentStatus('No slot times returned from server', 'warning');
                }
            } else {
                updatePaymentStatus(`Failed to get slot times: ${result.message || 'Server error'}`, 'error');
            }
        } catch (error) {
            updatePaymentStatus(`Error fetching slot times: ${error.message}`, 'error');
        } finally {
            button.disabled = false;
            button.textContent = 'Pay Slot Time';
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
        updatePaymentStatus(`Default slot time set: ${defaultTime}`, 'info');
        checkPaymentReadiness();
    }

    function setDefaultDate() {
        const dateSelect = document.getElementById('appointment-date');
        const currentDate = new Date();
        const defaultDate = new Date(currentDate);
        defaultDate.setDate(currentDate.getDate() + 7);
        const defaultDateString = defaultDate.toISOString().split('T')[0];

        let defaultOption = Array.from(dateSelect.options).find(option => option.value === defaultDateString);
        if (!defaultOption) {
            defaultOption = document.createElement('option');
            defaultOption.value = defaultDateString;
            defaultOption.textContent = defaultDateString;
            dateSelect.appendChild(defaultOption);
        }

        dateSelect.value = defaultDateString;
        updatePaymentStatus(`Default appointment date set: ${defaultDateString}`, 'info');
        handleAppointmentDateChange({ target: { value: defaultDateString } });
        return defaultDateString;
    }

    function setDefaultDateTime() {
        const timeSelect = document.getElementById('appointment-time');
        const defaultDate = setDefaultDate();
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
        updatePaymentStatus(`Default date & time set: ${defaultDate} at ${defaultTime}`, 'success');
        checkPaymentReadiness();
        return { date: defaultDate, time: defaultTime };
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

            console.log('Payment payload:', payload);

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
                paymentData.paymentUrl = result.data.url;

                const paymentBtn = document.getElementById('payment-btn');
                paymentBtn.disabled = false;
                paymentBtn.style.background = '#28a745';

                setTimeout(() => {
                    updatePaymentStatus(`
                        🎉 Payment URL received successfully!<br>
                        <strong>Options:</strong><br>
                        • Click "Payment" button to open in new tab<br>
                        • Or we can redirect directly to payment (like original site)<br>
                        <strong>Payment URL:</strong> ${result.data.url}
                    `, 'success');
                }, 1000);

                const autoRedirect = confirm('Payment URL received! Do you want to redirect to payment gateway now?\n\nClick OK to redirect immediately, or Cancel to use the Payment button.');
                if (autoRedirect) {
                    window.location.href = result.data.url;
                }
            } else {
                updatePaymentStatus(`Payment submission failed: ${result.message || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            updatePaymentStatus(`Network error: ${error.message}`, 'error');
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



