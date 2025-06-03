const React = require('React');

export default function EditRow({name, value, edittable}) {
  return ( 
    <tr>
    <td>{name}</td>
    <td>
    {value}
    </td>
    </tr>
  )
}
