import React, { useState, useEffect } from 'react';
import { Typography, Modal, Select, Tag, Space, Form } from 'antd';

const { Text } = Typography;

interface Props {
    isModalOpen: boolean;
    setIsModalOpen: (isModalOpen: boolean) => void;
    specGroups: string[];
    setSpecGroups: (specGroups: string[]) => void;
}

const CustomSpecGroupModal: React.FC<Props> = ({
    isModalOpen,
    setIsModalOpen,
    specGroups,
    setSpecGroups,
}: Props) => {
    const [inputValue, setInputValue] = useState<string[]>([]);
    const [error, setError] = useState<React.ReactNode | null>(null);

    const [form] = Form.useForm();

    const handleInputChange = (value: string[]) => {
        setInputValue(value);
    };

    const handleCancel = () => {
        setError(null);
        setInputValue([]);
        setTimeout(() => {
            setIsModalOpen(false);
        }, 0);
    };

    const handleOk = () => {
        form.validateFields();

        const duplicates = inputValue.filter((value) => specGroups.includes(value));
        if (duplicates.length) {
            setError(
                <span className='error-message'>
                    The following groups have already been added:{' '}
                    <strong>{duplicates.join(', ')}</strong>
                </span>,
            );
            return;
        } else if (inputValue.length < 1) {
            setError(<span className='error-message'>Please enter a Spec Group</span>);
            return;
        } else {
            setError(null);
        }
        setIsModalOpen(false);
        setSpecGroups([...specGroups, ...inputValue]);
        setInputValue([]);
        form.resetFields();
        setError(null);
    };

    const checkForDuplicates = () => {
        const duplicates = inputValue.filter((value) => specGroups.includes(value));
        if (duplicates.length) {
            setError(
                <span className='error-message'>
                    The following groups have already been added:{' '}
                    <strong>{duplicates.join(', ')}</strong>
                </span>,
            );
        } else {
            setError(null);
        }

        const selectItems = document.querySelectorAll('.ant-select-selection-item-content');
        selectItems.forEach((item) => {
            const itemContent = item.textContent?.trim();
            if (itemContent && specGroups.includes(itemContent)) {
                item.parentElement?.classList.add('item-error');
            } else {
                item.parentElement?.classList.remove('item-error');
            }
        });
    };

    useEffect(() => {
        if (isModalOpen) {
            checkForDuplicates();
        }
    }, [inputValue, specGroups]);

    return (
        <Modal
            title='Add Spec Group(s)'
            okText='Add Spec Group(s)'
            className='specs-modal'
            visible={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
        >
            <Space direction='vertical' size={24} className='w-full'>
                {specGroups.length > 0 && (
                    <Space className='w-full' direction='vertical' size={8}>
                        <Text strong>Spec Groups Already Added</Text>
                        <Space className='w-full' size={0}>
                            {specGroups.map((name, index) => (
                                <Tag key={index}>{name}</Tag>
                            ))}
                        </Space>
                    </Space>
                )}
                <Space direction='vertical' size={8} className='w-full'>
                    <Form form={form} layout='vertical' onFinish={handleOk}>
                        <Form.Item
                            label='Add Spec Group(s)'
                            validateStatus={error ? 'error' : ''}
                            help={
                                error ? (
                                    <Text className={`error ${isModalOpen ? '' : 'hidden'}`}>
                                        {error}
                                    </Text>
                                ) : null
                            }
                        >
                            <Select
                                mode='tags'
                                className='group-title-select w-full'
                                placeholder='Enter Spec Groups by comma or return separated'
                                onChange={handleInputChange}
                                tokenSeparators={[',']}
                                showArrow={false}
                                open={false}
                                value={inputValue}
                                onBlur={checkForDuplicates}
                            />
                        </Form.Item>
                    </Form>
                </Space>
            </Space>
        </Modal>
    );
};

export default CustomSpecGroupModal;
