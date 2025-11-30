// BarcodeOrderForm.js
import React, { useState } from 'react';

// ... (Your formStyles object remains the same) ...
const formStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    formContainer: {
        backgroundColor: 'white',
        padding: '40px', 
        borderRadius: '10px',
        width: '95%',
        maxWidth: '650px', 
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
        position: 'relative',
        maxHeight: '90vh', 
        overflowY: 'auto', 
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '25px',
    },
    closeButton: {
        position: 'absolute',
        top: '15px',
        right: '15px',
        background: 'none',
        border: 'none',
        fontSize: '2em',
        cursor: 'pointer',
        color: '#666',
    },
    inputGroup: {
        display: 'flex',
        gap: '20px', 
        marginBottom: '15px',
        flexWrap: 'wrap', 
    },
    inputField: {
        flex: 1,
        minWidth: '45%', 
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold', 
        fontSize: '0.9em',
        color: '#333',
    },
    inputStyle: {
        width: '100%',
        padding: '12px', 
        border: '1px solid #ddd', 
        borderRadius: '6px', 
        backgroundColor: '#f9f9f9',
        boxSizing: 'border-box',
        marginTop: '5px',
        fontSize: '1em',
    },
    textareaStyle: {
        minHeight: '100px', 
        resize: 'vertical',
        width: '100%',
    },
    uploadArea: {
        border: '2px dashed #ccc',
        padding: '30px',
        textAlign: 'center',
        backgroundColor: '#fafafa',
        borderRadius: '8px',
        cursor: 'pointer',
        marginTop: '15px'
    },
    buttonStyle: {
        width: '100%',
        padding: '15px', 
        backgroundColor: '#ff9900',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        marginTop: '30px',
        cursor: 'pointer',
        fontSize: '1.1em',
        fontWeight: '600',
    }
};


const BarcodeOrderForm = ({ serviceName, onClose }) => {
    const [formData, setFormData] = useState({
        model: '',
        purpose: '',
        price: '',
        description: '',
        name: '',
        phone: '',
        email: '',
        address: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Submitting order for: ${serviceName}`);
        // यहां आप API कॉल करके फॉर्म डेटा सबमिट कर सकते हैं
        onClose(); // सबमिट के बाद फॉर्म बंद करें
    };
    
    // ✅ Form के बाहर (ओवरले) पर क्लिक हैंडलर
    const handleOverlayClick = (e) => {
        // यह सुनिश्चित करता है कि क्लिक केवल ओवरले डिव पर हुआ है, 
        // न कि formContainer के अंदर किसी एलिमेंट पर।
        if (e.target === e.currentTarget) {
            onClose(); 
        }
    };

    return (
        // ✅ onClick event added to the overlay div
        <div style={formStyles.overlay} onClick={handleOverlayClick}>
            <div style={formStyles.formContainer}>
                <button style={formStyles.closeButton} onClick={onClose}>&times;</button>
                
                {/* Header Section */}
                <div style={formStyles.header}>
                    <span style={{ marginRight: '10px', fontSize: '1.5em' }}>&#9998;</span>
                    <h2 style={{margin: 0}}>Order Barcode for: {serviceName}</h2>
                </div>


                <form onSubmit={handleSubmit}>
                    
                    {/* Basic Information */}
                    <h3>Basic Information</h3>
                    <div style={formStyles.inputGroup}>
                        <div style={formStyles.inputField}>
                            <label style={formStyles.label} htmlFor="model">Vehicle model</label>
                            <input type="text" id="model" name="model" placeholder="Enter vehicle model" style={formStyles.inputStyle} onChange={handleChange} required />
                        </div>
                        <div style={formStyles.inputField}>
                            <label style={formStyles.label} htmlFor="purpose">Purpose</label>
                            <select id="purpose" name="purpose" style={formStyles.inputStyle} onChange={handleChange} required>
                                <option value="" disabled>Select purpose</option>
                                <option value="Sale">Sale</option>
                                <option value="Rent">Rent</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Price - Full Width */}
                    <div style={{...formStyles.inputField, flex: '1 1 100%'}}> 
                         <label style={formStyles.label} htmlFor="price">Price</label>
                         <input type="text" id="price" name="price" placeholder="Enter price" style={formStyles.inputStyle} onChange={handleChange} required />
                    </div>

                    {/* Description - Full Width */}
                    <div style={{...formStyles.inputField, flex: '1 1 100%', marginTop: '15px'}}>
                        <label style={formStyles.label} htmlFor="description">Description</label>
                        <textarea id="description" name="description" placeholder="Write a description of the product" style={{...formStyles.inputStyle, ...formStyles.textareaStyle}} onChange={handleChange} required></textarea>
                    </div>

                    {/* Contact Information */}
                    <h3>Contact Information</h3>
                    <div style={formStyles.inputGroup}>
                        <div style={formStyles.inputField}>
                            <label style={formStyles.label} htmlFor="name">Your name</label>
                            <input type="text" id="name" name="name" placeholder="Enter your name" style={formStyles.inputStyle} onChange={handleChange} required />
                        </div>
                        <div style={formStyles.inputField}>
                            <label style={formStyles.label} htmlFor="phone">Phone number</label>
                            <input type="tel" id="phone" name="phone" placeholder="Enter phone number" style={formStyles.inputStyle} onChange={handleChange} required />
                        </div>
                    </div>
                    <div style={formStyles.inputGroup}>
                        <div style={formStyles.inputField}>
                             <label style={formStyles.label} htmlFor="email">Email</label>
                            <input type="email" id="email" name="email" placeholder="Enter email" style={formStyles.inputStyle} onChange={handleChange} required />
                        </div>
                        <div style={formStyles.inputField}>
                             <label style={formStyles.label} htmlFor="address">Address</label>
                            <input type="text" id="address" name="address" placeholder="Enter your address" style={formStyles.inputStyle} onChange={handleChange} required />
                        </div>
                    </div>

                    {/* Image Upload Section */}
                    <h3 style={{marginTop: '25px'}}>Image (optional)</h3>
                    <div style={formStyles.uploadArea}>
                        <input type="file" id="image-upload" hidden />
                        <label htmlFor="image-upload" style={{cursor: 'pointer', color: '#666'}}>
                            <span style={{fontSize: '2.5em', display: 'block'}}>&#x2191;</span> 
                            <p style={{margin: '5px 0 0 0'}}>Upload image</p>
                        </label>
                    </div>

                    <button type="submit" style={formStyles.buttonStyle}>Create bar code</button>
                </form>
            </div>
        </div>
    );
};

export default BarcodeOrderForm;