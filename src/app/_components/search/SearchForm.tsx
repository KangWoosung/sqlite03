/*


*/
import { View, TextInput } from 'react-native'
import React, { forwardRef } from 'react'

interface SearchFormProps {
  onSearch: (text: string) => void;
}

const SearchForm = forwardRef<TextInput, SearchFormProps>(({ onSearch }, ref) => {
  return (
    <View className='p-8'>
      <TextInput
        className='p-4 border-2 border-foreground rounded-full text-xl'
        placeholder='검색어를 입력하세요'
        ref={ref}
        onChangeText={onSearch}
      />
    </View>
  )
})

export default SearchForm