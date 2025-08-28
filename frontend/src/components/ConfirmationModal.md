# ConfirmationModal Component

A reusable confirmation modal component for the Point of Sale application.

## Features

- **Reusable**: Can be used throughout the application for any confirmation dialog
- **Customizable**: Supports different types (danger, warning, info) with appropriate styling
- **Accessible**: Includes proper ARIA attributes and keyboard navigation
- **Responsive**: Works well on mobile and desktop devices
- **Animated**: Smooth slide-in animation for better UX

## Usage

### Basic Usage

```tsx
import ConfirmationModal from '../components/ConfirmationModal';

const [showModal, setShowModal] = useState(false);

const handleDelete = () => {
  setShowModal(true);
};

const performDelete = async () => {
  // Your delete logic here
  await deleteItem();
  setShowModal(false);
};

return (
  <div>
    <button onClick={handleDelete}>Delete Item</button>
    
    <ConfirmationModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      onConfirm={performDelete}
      title="Confirm Deletion"
      message="Are you sure you want to delete this item? This action cannot be undone."
      confirmText="Yes, Delete"
      cancelText="No, Keep it"
      type="danger"
    />
  </div>
);
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Controls whether the modal is visible |
| `onClose` | `() => void` | - | Function called when modal is closed |
| `onConfirm` | `() => void` | - | Function called when user confirms the action |
| `title` | `string` | - | Modal title |
| `message` | `string` | - | Modal message/description |
| `confirmText` | `string` | `"Yes, Delete"` | Text for the confirm button |
| `cancelText` | `string` | `"No, Keep it"` | Text for the cancel button |
| `type` | `'danger' \| 'warning' \| 'info'` | `'danger'` | Modal type affecting icon and button colors |

### Types

- **`danger`**: Red theme for destructive actions (delete, remove)
- **`warning`**: Yellow theme for cautionary actions
- **`info`**: Blue theme for informational confirmations

### Examples

#### Delete Confirmation
```tsx
<ConfirmationModal
  isOpen={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onConfirm={handleDelete}
  title="Confirm Deletion"
  message="Are you sure you want to delete this customer? This action cannot be undone."
  confirmText="Yes, Delete"
  cancelText="No, Keep it"
  type="danger"
/>
```

#### Warning Confirmation
```tsx
<ConfirmationModal
  isOpen={showWarningModal}
  onClose={() => setShowWarningModal(false)}
  onConfirm={handleAction}
  title="Warning"
  message="This action will affect multiple records. Are you sure you want to continue?"
  confirmText="Yes, Continue"
  cancelText="Cancel"
  type="warning"
/>
```

#### Info Confirmation
```tsx
<ConfirmationModal
  isOpen={showInfoModal}
  onClose={() => setShowInfoModal(false)}
  onConfirm={handleAction}
  title="Information"
  message="This will save your changes. Do you want to proceed?"
  confirmText="Yes, Save"
  cancelText="Cancel"
  type="info"
/>
```

## Styling

The modal uses the following CSS classes:
- `.confirm-modal-backdrop`: The overlay background
- `.confirm-modal`: The modal container
- `.confirm-modal-header`: The header section with title and icon
- `.confirm-modal-body`: The message section
- `.confirm-modal-actions`: The button container
- `.confirm-btn`: Base button styles
- `.confirm-btn.danger`: Red button for destructive actions
- `.confirm-btn.warning`: Yellow button for warnings
- `.confirm-btn.info`: Blue button for info
- `.confirm-btn.cancel`: Gray button for cancel actions

## Accessibility

- Uses proper ARIA attributes (`aria-modal`, `aria-label`)
- Supports keyboard navigation
- Focus management
- Screen reader friendly 