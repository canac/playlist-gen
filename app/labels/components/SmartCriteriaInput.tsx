import { useQuery } from "@blitzjs/rpc";
import { Text, TextInput, TextInputProps } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { assert } from "blitz";
import { useState } from "react";
import searchSmartCriteria from "../queries/searchSmartCriteria";

export default function SmartCriteriaInput(props: TextInputProps): JSX.Element {
  assert(typeof props.value === "string", "SmartCriteriaInput value is not a string");
  const [value, setValue] = useState(props.value);
  const [debouncedValue] = useDebouncedValue(value, 200);

  const [result] = useQuery(
    searchSmartCriteria,
    {
      smartCriteria: debouncedValue,
    },
    { enabled: debouncedValue.length > 0 },
  );

  return (
    <>
      <TextInput
        {...props}
        value={value}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setValue(event.target.value);
          props.onChange?.(event);
        }}
      />
      {result?.success === false && result.error.message && (
        <Text color="red" weight="bold">
          {result.error.message}
        </Text>
      )}
      {result?.success && (
        <Text>
          Smart criteria matches <strong>{result.data.matchCount}</strong> labels
          {result.data.matchCount > 0 ? (
            <>
              {" "}
              including <em>{result.data.matchExamples.join(", ")}</em>
            </>
          ) : null}
        </Text>
      )}
    </>
  );
}
