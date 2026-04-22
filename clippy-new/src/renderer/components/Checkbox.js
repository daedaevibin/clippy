"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Checkbox = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Checkbox = ({ id, label, checked = false, disabled = false, onChange, }) => {
    const handleChange = (e) => {
        if (onChange) {
            onChange(e.target.checked);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "field-row", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", id: id, checked: checked, disabled: disabled, onChange: handleChange }), (0, jsx_runtime_1.jsx)("label", { htmlFor: id, children: label })] }));
};
exports.Checkbox = Checkbox;
