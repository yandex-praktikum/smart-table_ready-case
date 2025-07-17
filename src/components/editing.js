

import { create } from "../lib/utils.js";

function Modal({ title, onClose, children }) {
    return create('div', {
        className: 'modal-overlay',
        onclick: (e) => e.target === e.currentTarget && onClose()
    }, 
    create('div', {
        className: 'modal-content'
    },
        create('div', {
            className: 'modal-header'
        },
            create('h2', {}, title),
            create('button', {
                className: 'modal-close',
                onclick: onClose
            }, '×')
        ),
        create('div', {
            className: 'modal-body'
        }, ...children)
    ));
}

function FormField({ type, name, label, value, options, required }) {
    const fieldId = `field-${name}`;
    
    let input;
    if (type === 'select' && options) {
        input = create('select', {
            id: fieldId,
            name,
            required: required ? 'required' : undefined
        }, 
            create('option', { value: '' }, 'Select...'),
            ...options.map(option => create('option', {
                value: option.value,
                selected: option.value === value ? 'selected' : undefined
            }, option.label))
        );
    } else {
        input = create('input', {
            id: fieldId,
            type: type || 'text',
            name,
            value: value || '',
            required: required ? 'required' : undefined
        });
    }

    return create('div', {
        className: 'form-field'
    },
        create('label', {
            htmlFor: fieldId
        }, label),
        input
    );
}

function Form({ schema, indexes, data = {}, onSubmit, onCancel, submitLabel = 'Save' }) {
    return create('form', {
        className: 'modal-form',
        onsubmit: (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const values = Object.fromEntries(formData.entries());
            onSubmit(values);
        }
    },
        ...schema.filter(field => field.name !== 'actions').map(field => {
            let options;
            let type = field.edit ?? 'text';
            if (type === 'select') {
                if (field.options) {
                    options = Object.values(indexes?.[field.options]).map(item => ({
                        value: item,
                        label: item
                    })) || [];
                } else {
                    type = 'text';
                }
            }
            
            return FormField({
                type,
                name: field.name,
                label: field.label,
                value: data[field.name],
                options,
                required: field.required
            });
        }),
        create('div', {
            className: 'form-actions'
        },
            create('button', {
                type: 'button',
                className: 'button',
                onclick: onCancel
            }, 'Cancel'),
            create('button', {
                type: 'submit',
                className: 'button button-add'
            }, submitLabel)
        )
    );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
    return create('div', {
        className: 'modal-overlay'
    },
    create('div', {
        className: 'modal-content modal-small'
    },
        create('div', {
            className: 'modal-header'
        },
            create('h2', {}, 'Confirm Action')
        ),
        create('div', {
            className: 'modal-body'
        },
            create('p', {}, message),
            create('div', {
                className: 'form-actions'
            },
                create('button', {
                    type: 'button',
                    className: 'button',
                    onclick: onCancel
                }, 'Cancel'),
                create('button', {
                    type: 'button',
                    className: 'button button-delete',
                    onclick: onConfirm
                }, 'Delete')
            )
        )
    ));
}

function ActionButtons({ data, onEdit, onDelete }) {
    return create('div', {
        className: 'table-actions'
    },
        create('button', {
            className: 'button',
            onclick: () => onEdit(data)
        }, 'Edit'),
        create('button', {
            className: 'button button-delete',
            onclick: () => onDelete(data)
        }, 'Delete')
    );
}

export function initEditing(redraw, api) {
    let currentModal = null;
    let indexes = {};
    
    const closeModal = () => {
        if (currentModal) {
            currentModal.remove();
            currentModal = null;
        }
    };

    const showModal = (modal) => {
        closeModal();
        currentModal = modal;
        document.body.appendChild(modal);
    };

    const handleAdd = (schema) => {
        const modal = Modal({
            title: 'Add New Record',
            onClose: closeModal,
            children: [
                Form({
                    schema,
                    indexes,
                    onSubmit: async (data) => {
                        try {
                            await api.createRecord(data);
                            closeModal();
                            redraw();
                        } catch (error) {
                            console.error('Error creating record:', error);
                            alert('Error creating record. Please try again.');
                        }
                    },
                    onCancel: closeModal,
                    submitLabel: 'Create'
                })
            ]
        });
        showModal(modal);
    };

    const handleEdit = (schema, record) => {
        const modal = Modal({
            title: 'Edit Record',
            onClose: closeModal,
            children: [
                Form({
                    schema,
                    indexes,
                    data: record,
                    onSubmit: async (data) => {
                        try {
                            await api.updateRecord(record.id, data);
                            closeModal();
                            redraw();
                        } catch (error) {
                            console.error('Error updating record:', error);
                            alert('Error updating record. Please try again.');
                        }
                    },
                    onCancel: closeModal,
                    submitLabel: 'Update'
                })
            ]
        });
        showModal(modal);
    };

    const handleDelete = (record) => {
        const modal = ConfirmDialog({
            message: 'Are you sure you want to delete this record? This action cannot be undone.',
            onConfirm: async () => {
                try {
                    await api.deleteRecord(record.id);
                    closeModal();
                    redraw();
                } catch (error) {
                    console.error('Error deleting record:', error);
                    alert('Error deleting record. Please try again.');
                }
            },
            onCancel: closeModal
        });
        showModal(modal);
    };

    const update = (nextIndexes) => {
        indexes = nextIndexes;
    }

    const plugin = (schema) => {
        // Add actions column with tag function for rendering buttons
        const actionsColumn = {
            name: 'actions',
            label: 'Actions',
            size: '1fr',
            tag: ({ data }) => ActionButtons({
                data,
                onEdit: (record) => handleEdit(schema, record),
                onDelete: handleDelete
            })
        };
        
        // Add actions column if it doesn't exist
        if (!schema.find(col => col.name === 'actions')) {
            schema.push(actionsColumn);
        }

        // Create add button header
        const addButton = create('div', {
            className: 'table-controls'
        },
            create('button', {
                className: 'button button-add',
                onclick: () => handleAdd(schema)
            }, 'Add New Record')
        );

        return { type: 'before', element: addButton };
    };

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    return { plugin, update };
}