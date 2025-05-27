import { TextField } from "@mui/material";
import styled from "styled-components";

export type InputProps = {
	value: string;
	setValue: (value: string) => void;

	width?: number;
	placeholder?: string;

	small?: boolean;
};


const SmallTextField = styled(TextField)`
	&&& .MuiOutlinedInput-input {
		padding: 3px 5px;
	}
`;

const MediumTextField = styled(TextField)`
	&&& .MuiOutlinedInput-input {
		padding: 7px 12px;
	}
`;

export const MyInput = (props: InputProps) => {
	const { value, setValue, width, placeholder, small = false } = props;

    const Component = small ? SmallTextField : MediumTextField;
	return (
		<Component
			autoComplete="off"
			sx={{ width }}
			variant="outlined"
			placeholder={placeholder}
			value={value}
			onChange={(e) => {
				setValue(e.target.value);
			}}
			onClick={e => e.stopPropagation()}
            onFocus={e => e.stopPropagation()}
		/>
	);
};

export const CourseCardAccordionHeader = styled.div`
	display: flex;
    flex-direction: column;
	width: 100%;
	gap: 10px;
`;

export const Group = styled.div`
	display: flex;
	align-items: center;
	gap: 7px;
`;

export const Centered = styled.div`
	width: 100%;
	display: flex;
	justify-content: center;
`;
