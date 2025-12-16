import { render, screen } from '@testing-library/react'

describe('Example', () => {
  it('renders a heading', () => {
    render(<h1>Hello World</h1>)
    const heading = screen.getByText('Hello World')
    expect(heading).toBeInTheDocument()
  })
})
