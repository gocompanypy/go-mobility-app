import React from 'react';
import { Input } from '@/components/ui/input';

const AddressInput = (props) => {
    return (
        <Input {...props} placeholder="Dirección..." />
    );
};

export default AddressInput;
