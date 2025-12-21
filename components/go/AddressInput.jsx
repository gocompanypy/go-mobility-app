import React from 'react';
import { Input } from '@/components/ui/input';

const AddressInput = ({ savedPlaces, ...props }) => {
    return (
        <Input {...props} placeholder="Dirección..." />
    );
};

export default AddressInput;
