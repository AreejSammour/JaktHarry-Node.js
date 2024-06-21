import { initializeApp, cert } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage';

const serviceAccount = {
    "type": "",
    "project_id": "",
    "private_key_id": "",
    "private_key": "",
    "client_email": "",
    "client_id": "",
    "auth_uri": "",
    "token_uri": "",
    "auth_provider_x509_cert_url": "",
    "client_x509_cert_url": "",
    "universe_domain": "",
};

initializeApp({
    credential: cert(serviceAccount),
    storageBucket: "",
});

export const bucket = getStorage().bucket(); // Gets a reference to your storage bucket
