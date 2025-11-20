import React from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import GlobalEditor from '../common/GlobalEditor/GlobalEditor';

const Home = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const formRef = React.useRef<any>(null);
    const handleImageUpload = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('file_url', file);
            // const response = await TemplateService.addTemplateImage({ bodyData: formData });
            // const { data } = response;
            // if (data) {
            //     return data;
            // }
        } catch (err) {
            console.error('err', err);
        }
    };

    const handleImageDelete = async (id: string) => {
        // try {
        //     const formData = new FormData();
        //     formData.append('id', id);
        //     const response = await TemplateService.deleteTemplateImage({ bodyData: formData });
        //     const { data } = response;
        //     if (data) {
        //         return data;
        //     }
        // } catch (err) {
        //     console.error('err', err);
        // }
    };
    return (
        <div className=' my-3'>
            <GlobalEditor
                generateFullHtml
                styles={{ height: '480px' }}
                showEditorInCard={false}
                onSubmit={val => { 
                    formRef?.current?.setFieldValue('media_attachment', 41); 
                    formRef?.current?.setFieldValue('body', val); 
                    formRef?.current?.handleSubmit(); 
                }}
                // imageUploadApi={handleImageUpload}
                // imageDeleteApi={handleImageDelete}
                buttonText="Save Template"
                initialContent={location.state ? location.state.body : 'Template Content...'}
                onCancel={() => navigate(-1)}
            />
        </div>
    );
};

export default Home;
