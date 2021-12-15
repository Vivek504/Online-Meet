import React from 'react';
import { useParams } from 'react-router-dom';

function Meet() {
    let {meet_code} = useParams();
    
    return(
        <>
            Hello {meet_code}
        </>
    )
}

export default Meet;