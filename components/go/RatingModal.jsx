import React from 'react';

const RatingModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg">
                <h2>Califica tu viaje</h2>
                <button onClick={onClose}>Cerrar</button>
            </div>
        </div>
    );
};

export default RatingModal;
